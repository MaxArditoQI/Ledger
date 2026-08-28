import './style.css';

const transactions = [
  { title: 'Cena da Mario', date: '15/12/2025', amount: '€52,80', status: 'VERIFICATO', category: 'Spesa', chat: true },
  { title: 'Bolletta luce', date: '17/08/2026', amount: '€54,00', status: 'IN CORSO', category: 'Bollette' },
  { title: 'Spesa settimanale', date: '12/08/2026', amount: '€84,30', status: 'SALDATO', category: 'Spesa' },
  { title: 'Abbonamento streaming', date: '01/08/2026', amount: '€15,99', status: 'SALDATO', category: 'Extra' },
  { title: 'Spesa mensile', date: '05/06/2026', amount: '€120,00', status: 'SALDATO', category: 'Spesa' },
  { title: 'Riparazione auto', date: '22/04/2026', amount: '€350,00', status: 'VERIFICATO', category: 'Spesa' },
  { title: 'Affitto appartamento', date: '10/03/2026', amount: '€850,00', status: 'IN CORSO', category: 'Bollette' },
  { title: 'Libri scolastici', date: '15/01/2026', amount: '€89,50', status: 'IN ATTESA', category: 'Spesa' }
];

const state = { page: 'dashboard', time: '<1 mese', category: 'Tutte', division: 'equal', participants: [{ name: 'Tu', amount: 0 }, { name: 'Giulia', amount: 0 }, { name: 'Marco', amount: 0 }], advanceMode: 'none', advancedBy: 'Tu', responsible: 'Tu', paidParticipant: '', modal: null, toast: '' };
const app = document.querySelector('#app');

function icon(name) {
  const icons = {
    grid: '<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
    plus: '+',
    history: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><path d="M12 7v5l3 2"/></svg>',
    bell: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H8l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg>',
    user: '○', chat: '▱', arrow: '→', close: '×', warning: '⚠'
  };
  return `<span class="icon" aria-hidden="true">${icons[name] || ''}</span>`;
}
function setPage(page) { state.page = page; state.modal = null; render(); }
function flash(message) { state.toast = message; render(); setTimeout(() => { state.toast = ''; render(); }, 2500); }
function statusClass(status) { return status.includes('SALDATO') ? 'paid' : status.includes('ATTESA') ? 'pending' : status.includes('SCADUTO') ? 'overdue' : 'verified'; }
function timeFilters(all = false) {
  const values = all ? ['Oggi', '<1 mese', '<6 mesi', 'Tutti'] : ['Oggi', '<1 mese', '<6 mesi', '>6 mesi'];
  return `<div class="time-filter"><span class="filter-label">FILTRO DATE</span>${values.map(value => `<button class="filter ${state.time === value ? 'active' : ''}" data-time="${value}">${value}</button>`).join('')}</div>`;
}
function header(title, eyebrow = 'REGISTRO CONDIVISO') { return `<header class="page-header"><div><p class="eyebrow">${eyebrow}</p><h1>${title}</h1></div><button class="avatar" title="Profilo" data-page="profile">MG</button></header>`; }
function transactionRow(item) { 
  // Se è una voce da ricevere (da mostrare nella sezione "Da ricevere"), aggiungi i pulsanti
  if (item.category === 'Spesa' && (item.status === 'VERIFICATO' || item.status === 'IN ATTESA')) {
    return `<article class="transaction-row">
      <div class="transaction-mark">${item.category === 'Bollette' ? '⌁' : '€'}</div>
      <div class="transaction-info">
        <strong>${item.title}</strong>
        <span>${item.date} · ${item.category}</span>
      </div>
      <strong class="transaction-amount">${item.amount}</strong>
      <span class="status ${statusClass(item.status)}">${item.status}</span>
      ${item.chat ? `<button class="icon-button" title="Apri chat contestuale" data-action="chat">${icon('chat')}</button>` : '<span class="row-spacer"></span>'}
      <div class="transaction-buttons">
        <button class="table-button" data-action="remind" data-title="${item.title}">SOLLECITA</button>
        <button class="table-button" data-action="close" data-title="${item.title}">CHIUDI/CONDONA</button>
      </div>
    </article>`;
  }
  
  // Per le altre voci, mantieni il comportamento originale
  return `<article class="transaction-row">
    <div class="transaction-mark">${item.category === 'Bollette' ? '⌁' : '€'}</div>
    <div class="transaction-info">
      <strong>${item.title}</strong>
      <span>${item.date} · ${item.category}</span>
    </div>
    <strong class="transaction-amount">${item.amount}</strong>
    <span class="status ${statusClass(item.status)}">${item.status}</span>
    ${item.chat ? `<button class="icon-button" title="Apri chat contestuale" data-action="chat">${icon('chat')}</button>` : '<span class="row-spacer"></span>'}
  </article>`;
}
function sidebar() { const links = [['dashboard','grid','Registro'],['new','plus','Nuova transazione'],['history','history','Storico'],['notifications','bell','Notifiche']]; return `<aside class="sidebar"><div class="brand"><span class="brand-mark">L</span><span>ledger</span></div><nav>${links.map(([page, ico, label]) => `<button class="nav-item ${state.page === page ? 'selected' : ''}" data-page="${page}">${icon(ico)}<span>${label}</span>${page === 'notifications' ? '<b class="nav-count">3</b>' : ''}</button>`).join('')}</nav><div class="sidebar-bottom"><button class="nav-item" data-page="detail">${icon('user')}<span>Il tuo profilo</span></button><div class="workspace"><small>SPAZIO CONDIVISO</small><strong>Casa Giulia</strong><span>4 membri attivi</span></div></div></aside>`; }
function dashboard() { return `<section>${header('Home - Registro','PANORAMICA · AGOSTO 2026')}${timeFilters()}<div class="balance-grid"><div class="balance-card primary" data-balance="net"><span>Saldo netto</span><strong>€ 126,40</strong><small>+ €18,00 da ricevere</small></div><div class="balance-card balance-link" data-balance="payable" role="button" tabindex="0"><span>Da pagare</span><strong>€ 54,00</strong><small class="danger-text">1 quota scaduta</small></div><div class="balance-card balance-link" data-balance="receivable" role="button" tabindex="0"><span>Da ricevere</span><strong>€ 72,40</strong><small class="success-text">2 quote in arrivo</small></div></div><div class="section-heading"><div><p class="eyebrow">ATTIVITÀ</p><h2>Transazioni recenti</h2></div><button class="text-button" data-page="history">Registro completo ${icon('arrow')}</button></div><div class="transaction-list">${transactions.slice(0,3).map(transactionRow).join('')}</div><div class="section-heading compact"><div><p class="eyebrow">AZIONI RICHIESTE</p><h2>Da saldare</h2></div></div><div class="notice-strip"><span class="notice-dot"></span><div><strong>Importo dovuto: €18,00</strong><span>Scadenza: 20/08 · Giulia</span></div><button class="outline-button" data-modal="reminder">SOLLECITA ORA</button></div></section>`; }
function balanceList() { const payable = state.balance === 'payable'; const title = payable ? 'Voci da pagare' : 'Voci da ricevere'; const eyebrow = payable ? 'USCITE IN SOSPESO' : 'QUOTE IN ARRIVO'; const entries = payable ? [{ title: 'Bolletta luce', date: '17/08/2026', amount: '€54,00', status: 'IN CORSO', category: 'Bollette' }] : [{ title: 'Cena da Mario', date: '15/12/2025', amount: '€52,80', status: 'VERIFICATO', category: 'Spesa', chat: true }, { title: 'Spesa settimanale', date: '12/08/2026', amount: '€19,60', status: 'IN ATTESA', category: 'Spesa' }]; return `<section>${header(title, eyebrow)}<div class="balance-summary"><span>${entries.length} ${entries.length === 1 ? 'voce' : 'voci'} corrispondenti</span><strong>${payable ? '€54,00 complessivi' : '€72,40 complessivi'}</strong></div><div class="transaction-list">${entries.map(transactionRow).join('')}</div><button class="secondary-button back-button" data-page="dashboard">← TORNA A HOME</button></section>`; }
function newTransaction() { 
  const total = 0; 
  const share = total / state.participants.length; 
  const custom = state.division !== 'equal'; 
  const lockedForUser = state.advanceMode === 'advanced' && state.advancedBy !== 'Tu'; 
  return `<section>${header('Registra transazione','NUOVO MOVIMENTO')}<form class="form-panel" id="transaction-form">
    <div class="form-grid">
      <label>IMPORTO<input id="transaction-total" value="" inputmode="decimal" /></label>
      <label>DATA<input type="date" value="${new Date().toISOString().split('T')[0]}" /></label>
    </div>
    <label>DESCRIZIONE<input value="" /></label>
    <fieldset>
      <legend>ANTICIPO DELLA SPESA</legend>
      <label class="radio-option">
        <input type="radio" name="advance" value="none" ${state.advanceMode === 'none' ? 'checked' : ''} /> Nessuno ha anticipato
      </label>
      <label class="radio-option">
        <input type="radio" name="advance" value="advanced" ${state.advanceMode === 'advanced' ? 'checked' : ''} /> Qualcuno ha anticipato la spesa
      </label>
      ${state.advanceMode === 'advanced' ? `
        <label class="inline-field">Chi ha anticipato<select data-advanced-by>${state.participants.map(person => `<option ${state.advancedBy === person.name ? 'selected' : ''}>${person.name}</option>`).join('')}</select></label>
        <p class="advance-note">Chi deve pagare le quote ha un debito verso ${state.advancedBy}. Solo questa persona puo modificare le cifre finche la spesa non e stata saldata.</p>
      ` : `
        <label class="inline-field">Responsabile che ricevera i soldi<select data-responsible>${state.participants.map(person => `<option ${state.responsible === person.name ? 'selected' : ''}>${person.name}</option>`).join('')}</select></label>
        <p class="advance-note">Il responsabile ricevera le quote dagli altri partecipanti.</p>
      `}
    </fieldset>
    <fieldset>
      <div class="fieldset-heading">
        <legend>PARTECIPANTI</legend>
        <button type="button" class="text-button" data-add-participant>+ AGGIUNGI</button>
      </div>
      <div class="participant-editor">
        ${state.participants.map((person, index) => `
          <div class="participant-row">
            <input class="participant-name" data-participant-name="${index}" value="${person.name}" aria-label="Nome partecipante" />
            <div class="share-fields">
              ${custom ? `
                <input class="share-percent" data-participant-percent="${index}" type="number" min="0" max="100" step="0.01" value="${(person.amount / (total || 1) * 100).toFixed(2)}" aria-label="Percentuale quota" ${lockedForUser ? 'disabled' : ''} />
                <span>%</span>
              ` : ''}
              <input class="share-amount" data-participant-amount="${index}" value="€${(state.division === 'equal' ? share : person.amount).toFixed(2).replace('.', ',')}" ${custom ? '' : 'readonly'} ${lockedForUser ? 'disabled' : ''} aria-label="Importo quota" />
            </div>
            <button type="button" class="remove-participant" data-remove-participant="${index}" aria-label="Rimuovi ${person.name}">×</button>
          </div>
        `).join('')}
      </div>
      ${lockedForUser ? `<p class="form-warning">Modifica riservata a ${state.advancedBy}: e l'unico autorizzato a cambiare le cifre.</p>` : ''}
      ${state.participants.length < 2 ? '<p class="form-warning">Aggiungi almeno due partecipanti per dividere la spesa.</p>' : ''}
    </fieldset>
    <fieldset>
      <legend>DIVISIONE TRA</legend>
      <label class="radio-option">
        <input type="radio" name="division" value="equal" ${state.division === 'equal' ? 'checked' : ''} /> Dividi in parti uguali
      </label>
      <label class="radio-option">
        <input type="radio" name="division" value="exception" ${state.division === 'exception' ? 'checked' : ''} /> Dividi con eccezioni <span class="new-badge">NUOVO</span>
      </label>
      <label class="radio-option">
        <input type="radio" name="division" value="custom" ${state.division === 'custom' ? 'checked' : ''} /> Personalizza
      </label>
    </fieldset>
    ${state.division === 'exception' ? `
      <div class="exception-box">
        <label>ESCLUDI PARTECIPANTE DA<select><option>Marco escluso da: Vino</option><option>Giulia esclusa da: Dolce</option></select></label>
        <label>IMPORTO ECCEZIONE<input value="€5,00" /></label>
      </div>
    ` : ''}
    ${custom ? '<div class="quote-total"><span>Totale quote</span><strong>€0,00 / €0,00</strong></div>' : ''}
    <p class="formal-note">La registrazione e modificabile finche nessuno ha pagato la propria quota. Dopo un pagamento, solo chi ha anticipato puo cambiare le cifre.</p>
    <div class="form-actions">
      <button type="button" class="secondary-button" data-page="dashboard">ANNULLA</button>
      <button type="submit" class="primary-button">SALVA TRANSAZIONE ${icon('arrow')}</button>
    </div>
  </form></section>`; 
}
function history() { 
  const filtered = state.category === 'Tutte' ? transactions : transactions.filter(item => item.category === state.category);
  
  // Applica il filtro per data
  let datedFiltered = filtered;
  if (state.time !== 'Tutti') {
    const today = new Date();
    datedFiltered = filtered.filter(item => {
      const [day, month, year] = item.date.split('/').map(Number);
      const itemDate = new Date(year, month - 1, day);
      
      // Debug: mostra le date per verifica
      // console.log("Item date:", itemDate, "Today:", today, "Time filter:", state.time);
      
      if (state.time === 'Oggi') {
        return itemDate.toDateString() === today.toDateString();
      } else if (state.time === '<1 mese') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return itemDate >= oneMonthAgo && itemDate <= today;
      } else if (state.time === '<6 mesi') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return itemDate >= sixMonthsAgo && itemDate <= today;
      } else if (state.time === '>6 mesi') {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        return itemDate < sixMonthsAgo;
      }
      return true;
    });
  }
  
  // Debug: mostra quanti elementi vengono filtrati
  // console.log("Filtered count:", datedFiltered.length, "Total:", filtered.length);
  
  return `<section>${header('Storico transazioni','ARCHIVIO')}<div class="category-filter">${['Tutte','Bollette','Spesa','Extra'].map(c => `<button class="filter ${state.category === c ? 'active' : ''}" data-category="${c}">${c}</button>`).join('')}</div>${timeFilters(true)}<div class="history-toolbar"><span>${datedFiltered.length} transazioni archiviate</span><button class="outline-button">ESPORTA CSV</button></div><div class="transaction-list">${datedFiltered.map(transactionRow).join('')}</div></section>`; 
}
function notifications() { return `<section>${header('Centro notifiche','COMUNICAZIONI FORMALI')}<div class="notification-list"><article class="notification-card overdue"><div class="notification-icon">${icon('warning')}</div><div><span class="notification-label">SCADENZA SUPERATA - SOLLECITO INVIATO</span><h3>Importo dovuto: €18,00 - Scadenza: 20/08</h3><p>Il sollecito è stato inviato a Giulia. In attesa di pagamento.</p></div><button class="outline-button" data-modal="reminder">SOLLECITA ORA</button></article><article class="notification-card pending"><div class="notification-icon">${icon('arrow')}</div><div><span class="notification-label">RICHIESTA PROROGA INVIATA</span><h3>Marco deve €18,00 - Bolletta luce - 17/08</h3><p>Richiesta di estensione inviata il 25/08. Stato: In attesa di approvazione.</p></div><button class="outline-button" data-action="remind">SOLLECITA ORA</button></article><article class="notification-card"><div class="notification-icon success-text">✓</div><div><span class="notification-label">PAGAMENTO RICEVUTO</span><h3>Giulia ha saldato €36,00</h3><p>Bolletta luce · 17/08 · Oggi alle 09:42</p></div></article></div></section>`; }
function detail() { return `<section>${header('Dettaglio spesa','TRANSAZIONE · 15 DIC 2025')}<div class="detail-hero"><div class="detail-icon">€</div><div><h2>Cena da Mario</h2><p>15/12/2025 · Spesa condivisa</p></div><strong>€52,80</strong></div><div class="section-heading compact"><div><p class="eyebrow">RIPARTIZIONE</p><h2>Partecipanti e quote</h2></div></div><div class="table-wrap"><table><thead><tr><th>Nome</th><th>Quota</th><th>Stato</th><th>Azione</th></tr></thead><tbody><tr><td>Tu</td><td>€17,40</td><td><span class="status paid">SALDATO</span></td><td>–</td></tr><tr><td>Giulia</td><td>€17,40</td><td><span class="status pending">IN ATTESA</span></td><td><button class="table-button">SOLLECITA</button></td></tr><tr><td>Marco</td><td>€17,40</td><td><span class="status overdue">SCADUTO</span></td><td><button class="table-button">SOLLECITA</button></td></tr></tbody></table></div><div class="detail-footer"><p class="formal-note">Le discussioni relative a questa spesa sono archiviate e consultabili.</p><button class="primary-button" data-action="chat">${icon('chat')} APRI CHAT CONTESTUALE</button></div></section>`; }
function profile() { return `<section>${header('Il tuo profilo','IMPOSTAZIONI ACCOUNT')}<div class="profile-layout"><div class="profile-photo-panel"><div class="profile-photo">MG</div><h2>Massimo Giuliana</h2><p>Amministratore dello spazio Casa Giulia</p><label class="upload-button">CAMBIA FOTO<input type="file" accept="image/*" /></label></div><form class="profile-form" id="profile-form"><div class="section-heading compact"><div><p class="eyebrow">DATI PERSONALI</p><h2>Informazioni di contatto</h2></div></div><div class="form-grid"><label>NOME<input value="Massimo" /></label><label>COGNOME<input value="Giuliana" /></label></div><label>EMAIL<input type="email" value="m.giuliana78@gmail.com" /></label><label>TELEFONO<input type="tel" value="+39 333 456 7890" /></label><div class="section-heading compact"><div><p class="eyebrow">PAGAMENTI</p><h2>Mezzi di pagamento usati</h2></div><button type="button" class="text-button">+ AGGIUNGI</button></div><div class="payment-list"><div class="payment-method"><span class="payment-brand">VISA</span><div><strong>•••• 4242</strong><span>Utilizzata il 15/12/2025</span></div><span class="status verified">PREDEFINITA</span></div><div class="payment-method"><span class="payment-brand paypal">P</span><div><strong>PayPal</strong><span>m.giuliana78@gmail.com</span></div><button type="button" class="table-button">RIMUOVI</button></div></div><div class="section-heading compact"><div><p class="eyebrow">SICUREZZA</p><h2>Password</h2></div><button type="button" class="text-button">MODIFICA</button></div><div class="password-row"><span>••••••••••••</span><span class="status verified">AGGIORNATA OGGI</span></div><div class="form-actions"><button type="button" class="secondary-button" data-page="dashboard">ANNULLA</button><button type="submit" class="primary-button">SALVA MODIFICHE ${icon('arrow')}</button></div></form></div></section>`; }
function chat() { return `<section>${header('Chat contestuale','CONVERSAZIONE ANCORATA')}<div class="chat-title"><div class="detail-icon">€</div><div><h2>Cena da Mario</h2><p>15/12/2025 · €52,80</p></div><span class="status verified">VERIFICATO</span></div><div class="chat-log"><div class="chat-date">15 DICEMBRE 2025</div><article><time>15/12 20:30</time><strong>Tu</strong><p>Manca lo scontrino della cena</p></article><article><time>15/12 21:15</time><strong>Mario</strong><p>Lo invio domani</p></article><article><time>16/12 09:00</time><strong>Mario</strong><p class="receipt">[Foto scontrino] <span>JPG · 842 KB</span></p></article></div><form class="chat-input" id="chat-form"><input placeholder="Scrivi un messaggio..." /><button class="primary-button" type="submit">INVIA ${icon('arrow')}</button></form><p class="formal-note">Questa chat è ancorata alla spesa e non è visibile altrove.</p></section>`; }
function modal(type) { if (!type) return ''; if (type === 'error') return `<div class="modal-backdrop"><div class="modal error-modal"><button class="modal-close" data-close>×</button><div class="modal-symbol">${icon('warning')}</div><p class="eyebrow">VALIDAZIONE TRANSAZIONE</p><h2>Errore 403: Modifica non consentita</h2><p>Impossibile modificare una transazione parzialmente saldata. Stato: In corso di saldo. Contattare l'amministratore.</p><button class="primary-button full" data-close>OK</button></div></div>`; return `<div class="modal-backdrop"><div class="modal extension-modal"><button class="modal-close" data-close>×</button><p class="eyebrow">COMUNICAZIONE AL CREDITORE</p><h2>RICHIESTA PROROGA FORMALE</h2><p>Stai richiedendo una proroga per il debito di €18,00 verso Giulia (Bolletta luce - 17/08). Il debito rimarrà visibile come 'Scaduto' fino all'approvazione del creditore.</p><label>MOTIVO DELLA RICHIESTA<textarea placeholder="Inserisci una motivazione formale..."></textarea></label><label>NUOVA DATA PROPOSTA<input type="date" value="2026-08-30" /></label><div class="form-actions"><button class="secondary-button" data-close>ANNULLA</button><button class="primary-button" data-action="send-extension">INVIA RICHIESTA</button></div></div></div>`; }
function render() { let content = state.page === 'dashboard' ? dashboard() : state.page === 'new' ? newTransaction() : state.page === 'history' ? history() : state.page === 'notifications' ? notifications() : state.page === 'detail' ? detail() : state.page === 'profile' ? profile() : state.page === 'balances' ? balanceList() : chat(); app.innerHTML = `<div class="app-shell">${sidebar()}<main>${content}</main></div>${state.toast ? `<div class="toast">${state.toast}</div>` : ''}${modal(state.modal)}`; bind(); }
function syncQuotes(index, value, source) { 
  const total = parseFloat(document.getElementById('transaction-total').value.replace(',', '.')) || 0;
  const selected = Math.max(0, Math.min(source === 'percent' ? 100 : total, Number(value) || 0));
  state.participants[index].amount = source === 'percent' ? total * selected / 100 : selected; 
  const remaining = Math.max(0, total - state.participants[index].amount); 
  const otherIndexes = state.participants.map((_, participantIndex) => participantIndex).filter(participantIndex => participantIndex !== index); 
  const othersTotal = otherIndexes.reduce((sum, participantIndex) => sum + state.participants[participantIndex].amount, 0); 
  otherIndexes.forEach(participantIndex => { 
    state.participants[participantIndex].amount = othersTotal > 0 ? remaining * state.participants[participantIndex].amount / othersTotal : remaining / otherIndexes.length; 
  }); 
  
  document.querySelectorAll('[data-participant-amount]').forEach(input => { 
    const participantIndex = Number(input.dataset.participantAmount); 
    input.value = `€${state.participants[participantIndex].amount.toFixed(2).replace('.', ',')}`; 
  }); 
  
  document.querySelectorAll('[data-participant-percent]').forEach(input => { 
    const participantIndex = Number(input.dataset.participantPercent); 
    input.value = (state.participants[participantIndex].amount / (total || 1) * 100).toFixed(2); 
  }); 
}
function bind() { document.querySelectorAll('[data-page]').forEach(el => el.addEventListener('click', () => setPage(el.dataset.page))); document.querySelectorAll('[data-balance]').forEach(el => el.addEventListener('click', () => { if (el.dataset.balance !== 'net') { state.balance = el.dataset.balance; state.page = 'balances'; render(); } })); document.querySelectorAll('[data-time]').forEach(el => el.addEventListener('click', () => { state.time = el.dataset.time; render(); })); document.querySelectorAll('[data-category]').forEach(el => el.addEventListener('click', () => { state.category = el.dataset.category; render(); })); document.querySelectorAll('[data-modal]').forEach(el => el.addEventListener('click', () => { state.modal = el.dataset.modal; render(); })); document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', () => { state.modal = null; render(); })); document.querySelectorAll('[data-action="chat"]').forEach(el => el.addEventListener('click', () => setPage('chat'))); document.querySelectorAll('[data-action="remind"]').forEach(el => el.addEventListener('click', () => flash('Sollecito inviato correttamente')));
document.querySelectorAll('[data-action="send-extension"]').forEach(el => el.addEventListener('click', () => { state.modal = null; flash('Richiesta di proroga inviata'); }));
// Aggiungi gestione click per aprire i dettagli dalle transazioni nello storico
document.querySelectorAll('.transaction-row').forEach(el => {
  el.addEventListener('click', (e) => {
    // Non gestire il click se è sul pulsante o sull'icona
    if (e.target.classList.contains('icon-button') || 
        e.target.classList.contains('table-button') ||
        e.target.closest('.table-button') ||
        e.target.closest('.icon-button')) {
      return;
    }
    // Apri la vista dettagli
    state.page = 'detail';
    render();
  });
});
document.querySelectorAll('[data-action="close"]').forEach(el => el.addEventListener('click', () => { 
  const title = el.dataset.title;
  flash(`Crediti per "${title}" chiusi/condonati`);
})); document.querySelectorAll('input[name="division"]').forEach(el => el.addEventListener('change', () => { state.division = el.value; if (el.value === 'equal') { const share = 52.8 / state.participants.length; state.participants.forEach(person => person.amount = share); } render(); })); document.querySelectorAll('input[name="advance"]').forEach(el => el.addEventListener('change', () => { state.advanceMode = el.value; render(); })); document.querySelector('[data-advanced-by]')?.addEventListener('change', e => { state.advancedBy = e.target.value; render(); }); document.querySelector('[data-responsible]')?.addEventListener('change', e => { state.responsible = e.target.value; }); document.querySelectorAll('[data-add-participant]').forEach(el => el.addEventListener('click', () => { state.participants.push({ name: `Partecipante ${state.participants.length + 1}`, amount: 52.8 / (state.participants.length + 1) }); if (state.division === 'equal') { const share = 52.8 / state.participants.length; state.participants.forEach(person => person.amount = share); } render(); })); document.querySelectorAll('[data-remove-participant]').forEach(el => el.addEventListener('click', () => { if (state.participants.length > 2) { state.participants.splice(Number(el.dataset.removeParticipant), 1); if (state.division === 'equal') { const share = 52.8 / state.participants.length; state.participants.forEach(person => person.amount = share); } render(); } else flash('Servono almeno due partecipanti'); })); document.querySelectorAll('.participant-name').forEach(el => el.addEventListener('input', () => { state.participants[Number(el.dataset.participantName)].name = el.value; })); document.querySelectorAll('.share-percent').forEach(el => el.addEventListener('input', () => syncQuotes(Number(el.dataset.participantPercent), el.value, 'percent'))); document.querySelectorAll('.share-amount').forEach(el => el.addEventListener('input', () => syncQuotes(Number(el.dataset.participantAmount), el.value.replace(',', '.').replace('€', ''), 'amount'))); document.querySelector('#transaction-form')?.addEventListener('submit', e => { e.preventDefault(); const total = state.participants.reduce((sum, person) => sum + person.amount, 0); if (state.division !== 'equal' && Math.abs(total - 52.8) > 0.01) { flash('Il totale delle quote non corrisponde all’importo. Completa nuovamente le quote.'); return; } state.modal = 'error'; render(); }); document.querySelector('#profile-form')?.addEventListener('submit', e => { e.preventDefault(); flash('Profilo aggiornato correttamente'); }); document.querySelector('#chat-form')?.addEventListener('submit', e => { e.preventDefault(); flash('Messaggio inviato'); }); }
render();
