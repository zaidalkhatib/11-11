import { emptyAnswers } from '../../../../mobile/src/onboarding';
import type { PreviewAnswers } from '../../../contracts/preview-adapter';
// Compile-only compatibility check, never imported by the app.
const currentShape: PreviewAnswers = emptyAnswers();
void currentShape;
