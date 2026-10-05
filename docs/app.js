import {
  GARAGE_PRESETS,
  buildLeadFields,
  calculateEstimateCents,
  formatCurrency,
  parseSquareFootage,
} from './calculator.mjs?v=rate475';

const state = {
  squareFeet: null,
  sizeSelection: '',
  finish: '',
  step: 'start',
};

const finishOptions = [
  ['Orbit', 'orbit.avif'],
  ['Cabin Fever', 'cabin-fever.avif'],
  ['Wombat', 'wombat.avif'],
  ['Domino', 'domino.avif'],
  ['Outback', 'outback.avif'],
  ['Creekbed', 'creekbed.avif'],
  ['Carbon', 'carbon.avif'],
  ['Shist', 'shist.avif'],
  ['Nightfall', 'nightfall.avif'],
  ['Shoreline', 'shoreline.avif'],
  ['Solid-color polyaspartic', 'solid-polyaspartic.svg'],
];

const garageOptions = [
  ['one', 'One-car garage', 'garage-one-car.png', '250 sq ft'],
  ['two', 'Two-car garage', 'garage-two-car.png', '500 sq ft'],
  ['three', 'Three-car garage', 'garage-three-car.png', '750 sq ft'],
  ['commercial', '4+ cars / commercial', 'garage-commercial.png', 'Enter your square footage'],
];

const wizardContent = document.querySelector('#wizard-content');
const leadPanel = document.querySelector('#lead-panel');
const progress = document.querySelector('#progress');
const leadForm = document.querySelector('#lead-form');
const estimateSummary = document.querySelector('#estimate-summary');
const formspreeSuccess = document.querySelector('#formspree-success');
const formspreeError = document.querySelector('#formspree-error');

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character]);
}

function setProgress(current) {
  progress.textContent = `Step ${current} of 4`;
  document.querySelectorAll('.stepper li').forEach((item, index) => {
    if (index + 1 === current) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
    item.dataset.complete = String(index + 1 < current);
  });
}

function focusCurrentHeading() {
  requestAnimationFrame(() => {
    document.querySelector(state.step === 'lead' ? '#lead-title' : '#wizard-content [data-current-heading]')?.focus();
  });
}

function renderStart() {
  setProgress(1);
  wizardContent.innerHTML = `
    <section class="step-panel" data-step="start">
      <p class="eyebrow">Start your estimate</p>
      <h1 data-current-heading tabindex="-1">Let’s size your space.</h1>
      <p class="lede">Tell us a little about your garage. Choose your finish, see your estimated total, and take the next step.</p>
      <div class="choice-stack" role="group" aria-label="Square-footage knowledge">
        <button class="choice-button" type="button" data-action="known">
          <span class="choice-number">01</span>
          <span><strong>I know my square footage</strong><small>Enter the number and continue.</small></span>
          <span aria-hidden="true">→</span>
        </button>
        <button class="choice-button" type="button" data-action="guide">
          <span class="choice-number">02</span>
          <span><strong>Help me estimate it</strong><small>Choose the garage size that fits best.</small></span>
          <span aria-hidden="true">→</span>
        </button>
      </div>
      <p class="fine-print">This is an estimate for planning. Your final project scope is confirmed on-site.</p>
    </section>`;
}

function renderManual() {
  setProgress(2);
  const commercial = state.sizeSelection === '4+ cars / commercial';
  wizardContent.innerHTML = `
    <section class="step-panel" data-step="manual">
      <p class="eyebrow">${commercial ? 'Commercial or large space' : 'Square footage'}</p>
      <h1 data-current-heading tabindex="-1">How big is the floor?</h1>
      <p class="lede">Enter your best estimate in whole square feet.</p>
      <label class="measure-field" for="square-feet">Square footage
        <div><input id="square-feet" name="square-feet" type="text" inputmode="numeric" autocomplete="off" value="${state.squareFeet ?? ''}" aria-describedby="square-feet-error"><span>sq ft</span></div>
      </label>
      <p class="field-error" id="square-feet-error" role="alert"></p>
      <p class="measurement-tip">Measuring it yourself? Length × width gives you square feet.</p>
      <div class="button-row">
        <button class="button button-quiet" type="button" data-action="manual-back">Back</button>
        <button class="button button-primary" type="button" data-action="manual-next">Next <span aria-hidden="true">→</span></button>
      </div>
    </section>`;
  document.querySelector('#square-feet')?.addEventListener('input', () => {
    document.querySelector('#square-feet-error').textContent = '';
    document.querySelector('#square-feet').removeAttribute('aria-invalid');
  });
}

function renderSizeGuide() {
  setProgress(2);
  const cards = garageOptions.map(([key, label, image, detail]) => `
    <button class="garage-card" type="button" data-garage="${key}">
      <img src="./images/${image}" alt="Illustrative ${label.toLowerCase()} size guide">
      <span class="card-copy"><strong>${label}</strong><small>${detail}</small></span>
    </button>`).join('');
  wizardContent.innerHTML = `
    <section class="step-panel" data-step="size-guide">
      <p class="eyebrow">Choose a size guide</p>
      <h1 data-current-heading tabindex="-1">Find your garage size.</h1>
      <p class="lede">These photos are illustrative size guides, not completed-project photos.</p>
      <div class="garage-grid">${cards}</div>
      <div class="button-row">
        <button class="button button-quiet" type="button" data-action="guide-back">Back</button>
      </div>
    </section>`;
}

function renderFinish() {
  setProgress(3);
  const cards = finishOptions.map(([label, image]) => {
    const selected = state.finish === label;
    return `
      <button class="finish-card" type="button" data-finish="${escapeHTML(label)}" aria-pressed="${selected}">
        <img src="./images/${image}" alt="${escapeHTML(label)} finish sample">
        <span>${escapeHTML(label)}</span>
        ${selected ? '<b aria-hidden="true">✓</b>' : ''}
      </button>`;
  }).join('');
  wizardContent.innerHTML = `
    <section class="step-panel" data-step="finish">
      <p class="eyebrow">Finish selection</p>
      <h1 data-current-heading tabindex="-1">Pick your finish.</h1>
      <p class="lede">Choose a flake blend, or select solid-color polyaspartic and choose the final color during consultation.</p>
      <div class="finish-grid" role="group" aria-label="Finish options">${cards}</div>
      <div class="button-row">
        <button class="button button-quiet" type="button" data-action="finish-back">Back</button>
        <button class="button button-primary" type="button" data-action="finish-next" ${state.finish ? '' : 'disabled'}>See my estimate <span aria-hidden="true">→</span></button>
      </div>
    </section>`;
}

function syncLeadFields() {
  const fields = buildLeadFields({
    squareFeet: state.squareFeet,
    sizeSelection: state.sizeSelection,
    finish: state.finish,
    submittedFrom: new URL('.', window.location.href).href,
  });
  for (const [name, value] of Object.entries(fields)) {
    leadForm.querySelector(`[name="${name}"]`).value = value;
  }
}

function renderLead() {
  setProgress(4);
  wizardContent.hidden = true;
  leadPanel.hidden = false;
  const total = formatCurrency(calculateEstimateCents(state.squareFeet));
  const totalElement = document.createElement('strong');
  const detailElement = document.createElement('span');
  totalElement.textContent = total;
  detailElement.textContent = `${state.squareFeet} sq ft · ${state.finish}`;
  estimateSummary.replaceChildren(totalElement, detailElement);
  syncLeadFields();
  focusCurrentHeading();
}

function render() {
  leadPanel.hidden = state.step !== 'lead';
  wizardContent.hidden = state.step === 'lead';
  if (state.step === 'lead') {
    renderLead();
    return;
  }

  switch (state.step) {
    case 'manual': renderManual(); break;
    case 'size-guide': renderSizeGuide(); break;
    case 'finish': renderFinish(); break;
    default: renderStart(); break;
  }
  focusCurrentHeading();
}

function setStep(step) {
  state.step = step;
  render();
}

function resetEstimate() {
  state.squareFeet = null;
  state.sizeSelection = '';
  state.finish = '';
  state.step = 'start';
  formspreeSuccess.textContent = '';
  formspreeError.textContent = '';
  leadForm.reset();
  render();
}

function selectGarage(key) {
  if (key === 'commercial') {
    state.squareFeet = null;
    state.sizeSelection = '4+ cars / commercial';
    setStep('manual');
    return;
  }
  state.squareFeet = GARAGE_PRESETS[key];
  state.sizeSelection = `${key}-car`;
  setStep('finish');
}

function handleWizardClick(event) {
  const button = event.target.closest('button');
  if (!button) return;

  if (button.dataset.action === 'known') {
    state.squareFeet = null;
    state.sizeSelection = 'manual';
    setStep('manual');
  } else if (button.dataset.action === 'guide') {
    setStep('size-guide');
  } else if (button.dataset.action === 'manual-back') {
    setStep(state.sizeSelection === '4+ cars / commercial' ? 'size-guide' : 'start');
  } else if (button.dataset.action === 'manual-next') {
    const result = parseSquareFootage(document.querySelector('#square-feet').value);
    if (!result.ok) {
      document.querySelector('#square-feet-error').textContent = result.error;
      document.querySelector('#square-feet').setAttribute('aria-invalid', 'true');
      document.querySelector('#square-feet').focus();
      return;
    }
    state.squareFeet = result.value;
    setStep('finish');
  } else if (button.dataset.action === 'guide-back') {
    setStep('start');
  } else if (button.dataset.garage) {
    selectGarage(button.dataset.garage);
  } else if (button.dataset.finish) {
    state.finish = button.dataset.finish;
    renderFinish();
    wizardContent.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
  } else if (button.dataset.action === 'finish-back') {
    setStep(['one-car', 'two-car', 'three-car'].includes(state.sizeSelection) ? 'size-guide' : 'manual');
  } else if (button.dataset.action === 'finish-next' && state.finish) {
    setStep('lead');
  }
}

wizardContent.addEventListener('click', handleWizardClick);
document.querySelector('#lead-back').addEventListener('click', () => setStep('finish'));
document.querySelector('#clear-estimate').addEventListener('click', resetEstimate);

leadForm.addEventListener('submit', (event) => {
  if (!state.squareFeet || !state.finish) {
    event.preventDefault();
    formspreeError.textContent = 'Please complete the estimate before sending your request.';
    return;
  }
  syncLeadFields();
});

render();
