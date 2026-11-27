export function Illustration({ kind, small = false }: { kind: string; small?: boolean }) {
  return <svg className={small ? 'illustration small' : 'illustration'} viewBox="0 0 240 155" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    {kind === 'dinner' ? <>
      <ellipse cx="120" cy="94" rx="61" ry="15"/><path d="M71 103l-8 34m106-34 8 34M92 106l-4 29m60-29 4 29M58 92V69c0-12-22-12-22 0v36l8 33m-8-33h21m125-13V69c0-12 22-12 22 0v36l-8 33m8-33h-21"/>
      <path d="M117 83V57h6v26m-8 0h10M96 74c-10 0-11-12-8-18h14c3 6 2 18-6 18Zm0 0v13m-6 0h12m42-13c-10 0-11-12-8-18h14c3 6 2 18-6 18Zm0 0v13m-6 0h12"/>
      <path className="flame" d="M120 52c-8-5-3-10 1-16 0 8 6 10-1 16Z" fill="currentColor" stroke="none"/>
      <path d="M106 30l-2-5m29 5 2-5M120 21v-5" opacity=".5"/>
    </> : kind === 'wander' ? <>
      <path d="M57 126c55-27 61-42 35-52s-5-25 39-36m-21 91c72-25 64-39 21-49s-8-31 20-43M32 127h32m106 0h38M48 115V69m-16 24 16-29 17 29H32Zm5-17L48 51l12 25m126 39V69m-15 24 15-29 17 29h-32Zm4-17 11-25 12 25"/>
      <circle cx="120" cy="25" r="9"/><path d="M119 7V2m19 23h7m-44 0h-7m39-13 4-4m-33 4-4-4"/>
    </> : <>
      <path d="M78 110c-18-9-17-27-6-36 7-6 12-9 11-17h42c-1 8 4 11 11 17 11 9 12 27-6 36-14 8-38 8-52 0Z"/><ellipse cx="104" cy="57" rx="21" ry="5"/><path d="m90 122 9 3m16-3-5 3M147 41l21 66 7-3-19-66-9 3Zm2-11c-10-7-5-17-1-22 4 10 10 11 7 19m8 13 19-9 15 28-20 10m1 11 5 36m-16 0h32M53 118h93"/>
      <path d="m57 35 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6Z"/>
    </>}
    </g>
  </svg>;
}

