import test from "node:test";
import assert from "node:assert/strict";
import {
  plansReducer,
  dateTypes,
  hasActiveInvite,
  dinnerItineraries,
  availableDinnerItineraries,
  formatEventWhen,
  nextDateLabelForWeekday,
} from "../src/date-plans.ts";

test("each itinerary creates exactly one card", () => {
  let plans = plansReducer([], {
    type: "add",
    dateType: "Dinner",
    itineraryId: "fri-gaslamp",
    day: "fri",
    time: "7:00pm",
    area: "gaslamp",
  });
  plans = plansReducer(plans, {
    type: "add",
    dateType: "Dinner",
    itineraryId: "fri-gaslamp",
    day: "fri",
    time: "7:00pm",
    area: "gaslamp",
  });
  assert.equal(plans.length, 1);
  assert.equal(plans[0].waiting, false);
  plans = plansReducer(plans, {
    type: "add",
    dateType: "Dinner",
    itineraryId: "sat-north-park",
    day: "sat",
    time: "8:00pm",
    area: "north park",
  });
  assert.equal(plans.length, 2);
});

test("joining one dinner hides only that itinerary from events", () => {
  let plans = plansReducer([], {
    type: "add",
    dateType: "Dinner",
    itineraryId: "fri-gaslamp",
    day: "fri",
    time: "7:00pm",
    area: "gaslamp",
  });
  plans = plansReducer(plans, {
    type: "patch",
    itineraryId: "fri-gaslamp",
    patch: { waiting: true, demoMatched: true },
  });
  const open = availableDinnerItineraries(plans);
  assert.equal(open.some((slot) => slot.id === "fri-gaslamp"), false);
  assert.ok(open.length === dinnerItineraries.length - 1);
  assert.equal(hasActiveInvite(plans[0]), true);
});

test("multiple dinners can be active invites at once", () => {
  let plans = plansReducer([], {
    type: "add",
    dateType: "Dinner",
    itineraryId: "fri-gaslamp",
    day: "fri",
    time: "7:00pm",
    area: "gaslamp",
  });
  plans = plansReducer(plans, {
    type: "add",
    dateType: "Dinner",
    itineraryId: "sun-la-jolla",
    day: "sun",
    time: "5:30pm",
    area: "la jolla",
  });
  plans = plansReducer(plans, {
    type: "patch",
    itineraryId: "fri-gaslamp",
    patch: { waiting: true, demoMatched: true },
  });
  plans = plansReducer(plans, {
    type: "patch",
    itineraryId: "sun-la-jolla",
    patch: { waiting: true, demoMatched: true },
  });
  assert.equal(plans.filter(hasActiveInvite).length, 2);
  assert.equal(availableDinnerItineraries(plans).length, dinnerItineraries.length - 2);
});

test("removal and restart clear only intended plans", () => {
  let plans = plansReducer([], {
    type: "add",
    dateType: "Dinner",
    itineraryId: "fri-gaslamp",
  });
  plans = plansReducer(plans, {
    type: "add",
    dateType: "Dinner",
    itineraryId: "sat-north-park",
  });
  assert.deepEqual(
    plansReducer(plans, { type: "remove", itineraryId: "fri-gaslamp" }).map((p) => p.itineraryId),
    ["sat-north-park"],
  );
  assert.deepEqual(plansReducer(plans, { type: "reset" }), []);
});

test("date selection presents dinner only for launch", () => {
  assert.deepEqual(dateTypes, ["Dinner"]);
});

test("canceling an invite returns that dinner to events", () => {
  let plans = plansReducer([], {
    type: "add",
    dateType: "Dinner",
    itineraryId: "fri-gaslamp",
    day: "fri",
    time: "7:00pm",
    area: "gaslamp",
  });
  plans = plansReducer(plans, {
    type: "patch",
    itineraryId: "fri-gaslamp",
    patch: { waiting: true, demoMatched: true },
  });
  plans = plansReducer(plans, { type: "remove", itineraryId: "fri-gaslamp" });
  assert.equal(availableDinnerItineraries(plans).some((slot) => slot.id === "fri-gaslamp"), true);
});

test("dinner itineraries offer multiple times and neighborhoods", () => {
  assert.ok(dinnerItineraries.length >= 3);
  const keys = new Set(dinnerItineraries.map((slot) => slot.id));
  assert.equal(keys.size, dinnerItineraries.length);
  for (const slot of dinnerItineraries) {
    assert.ok(slot.day);
    assert.ok(slot.date);
    assert.ok(slot.time);
    assert.ok(slot.area);
    assert.match(slot.title, /dinner/i);
  }
});

test("event when line includes weekday, calendar date, and time", () => {
  assert.equal(
    formatEventWhen({ day: "sat", date: "dec 6", time: "7:00pm" }),
    "Sat, Dec 6 · 7:00 pm",
  );
  assert.match(nextDateLabelForWeekday("fri"), /^[A-Z][a-z]{2} \d{1,2}$/);
});
