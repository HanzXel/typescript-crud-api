// ===================================================
//  FULL-STACK APP  –  script.js (connected to API)
// ===================================================

const API = 'http://localhost:4000';

// ===================================================
//  APP STATE
// ===================================================
let currentUser = null;
let requestModal;

// ===================================================
//  API HELPER
// ===================================================
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API + path, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'API error');
  return data;
}

// ===================================================
//  INIT
// ===================================================
document.addEventListener('DOMContentLoaded', async () => {
  requestModal = new bootstrap.Modal(document.getElementById('requestModal'));

  // Restore session
  const token = localStorage.getItem('auth_token');
  const savedUser = localStorage.getItem('current_user');
  if (token && savedUser) {
    currentUser = JSON.parse(savedUser);
    setAuthState(true, currentUser);
  }

  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = '#/';
  } else {
    handleRouting();
  }

  bindEvents();
});

// ===================================================
//  ROUTING
// ===================================================
const PROTECTED_ROUTES = ['#/profile', '#/requests'];
const ADMIN_ROUTES     = ['#/employees', '#/accounts', '#/departments'];

const ROUTE_MAP = {
  '#/':             'home',
  '#/register':     'register',
  '#/verify-email': 'verify',
  '#/login':        'login',
  '#/profile':      'profile',
  '#/employees':    'employees',
  '#/departments':  'departments',
  '#/accounts':     'accounts',
  '#/requests':     'requests',
};

function navigateTo(hash) {
  window.location.hash = hash;
}

function handleRouting() {
  const hash = window.location.hash || '#/';

  if (PROTECTED_ROUTES.includes(hash) && !currentUser) {
    navigateTo('#/login'); return;
  }
  if (ADMIN_ROUTES.includes(hash) && (!currentUser || currentUser.role !== 'admin')) {
    navigateTo(currentUser ? '#/' : '#/login'); return;
  }

  if (hash !== '#/login') {
    document.getElementById('loginVerifiedAlert').classList.add('d-none');
  }

  const pageKey = ROUTE_MAP[hash];
  document.querySelectorAll('.page').forEach(s => s.classList.remove('active'));

  if (pageKey) {
    const target = document.getElementById('page-' + pageKey);
    if (target) target.classList.add('active');

    if (pageKey === 'verify')       renderVerify();
    if (pageKey === 'profile')      renderProfile();
    if (pageKey === 'employees')    renderEmployees();
    if (pageKey === 'departments')  renderDepartments();
    if (pageKey === 'accounts')     renderAccounts();
    if (pageKey === 'requests')     renderRequests();
  } else {
    navigateTo('#/');
  }
}

window.addEventListener('hashchange', handleRouting);

// ===================================================
//  AUTH STATE
// ===================================================
function setAuthState(isAuth, user = null) {
  currentUser = isAuth ? user : null;
  const body  = document.body;

  if (isAuth && user) {
    body.classList.remove('not-authenticated');
    body.classList.add('authenticated');
    body.classList.toggle('is-admin', user.role === 'admin');
    document.getElementById('navUsername').textContent =
      user.firstName + ' ' + user.lastName;
  } else {
    body.classList.remove('authenticated', 'is-admin');
    body.classList.add('not-authenticated');
  }
}

// ===================================================
//  EVENT BINDING
// ===================================================
function bindEvents() {
  document.getElementById('navLoginLink').addEventListener('click', e => {
    e.preventDefault(); navigateTo('#/login');
  });
  document.getElementById('navRegisterLink').addEventListener('click', e => {
    e.preventDefault(); navigateTo('#/register');
  });

  document.getElementById('logoutBtn').addEventListener('click', e => {
    e.preventDefault();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    localStorage.removeItem('unverified_email');
    setAuthState(false);
    navigateTo('#/');
  });

  document.querySelectorAll('[data-page]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const page = el.dataset.page;
      navigateTo(page === 'home' || page === '' ? '#/' : '#/' + page);
    });
  });

  document.getElementById('getStartedBtn').addEventListener('click', () => {
    navigateTo(currentUser ? '#/profile' : '#/login');
  });

  document.getElementById('signUpBtn').addEventListener('click', handleRegister);
  document.getElementById('regPassword').addEventListener('keydown', e => {
    if (e.key === 'Enter') handleRegister();
  });

  document.getElementById('simulateVerifyBtn').addEventListener('click', handleSimulateVerify);

  document.getElementById('loginBtn').addEventListener('click', handleLogin);
  ['loginEmail', 'loginPassword'].forEach(id => {
    document.getElementById(id).addEventListener('keydown', e => {
      if (e.key === 'Enter') handleLogin();
    });
  });

  document.getElementById('addEmployeeBtn').addEventListener('click', () => openEmployeeForm());
  document.getElementById('saveEmployeeBtn').addEventListener('click', saveEmployee);
  document.getElementById('cancelEmployeeBtn').addEventListener('click', () => resetEmployeeForm());

  document.getElementById('addDeptBtn').addEventListener('click', () => openDeptForm());
  document.getElementById('saveDeptBtn').addEventListener('click', saveDept);
  document.getElementById('cancelDeptBtn').addEventListener('click', () => closeDeptForm());

  document.getElementById('addAccountBtn').addEventListener('click', () => openAccountForm());
  document.getElementById('saveAccountBtn').addEventListener('click', saveAccount);
  document.getElementById('cancelAccountBtn').addEventListener('click', () => closeAccountForm());

  document.getElementById('newRequestBtn').addEventListener('click', openRequestModal);
  document.getElementById('createOneBtn').addEventListener('click', openRequestModal);
  document.getElementById('submitRequestBtn').addEventListener('click', submitRequest);
  document.getElementById('addReqItemBtn').addEventListener('click', addReqItem);
}

// ===================================================
//  REGISTER
// ===================================================
async function handleRegister() {
  const firstName = document.getElementById('regFirstName').value.trim();
  const lastName  = document.getElementById('regLastName').value.trim();
  const email     = document.getElementById('regEmail').value.trim();
  const password  = document.getElementById('regPassword').value;
  const errEl     = document.getElementById('regError');

  errEl.classList.add('d-none');

  if (!firstName || !lastName || !email || !password) {
    errEl.textContent = 'Please fill in all fields.';
    errEl.classList.remove('d-none');
    return;
  }
  if (password.length < 6) {
    errEl.textContent = 'Password must be at least 6 characters.';
    errEl.classList.remove('d-none');
    return;
  }

  try {
    await apiFetch('/accounts/register', {
      method: 'POST',
      body: JSON.stringify({ firstName, lastName, email, password })
    });

    localStorage.setItem('unverified_email', email);
    ['regFirstName','regLastName','regEmail','regPassword'].forEach(
      id => document.getElementById(id).value = ''
    );
    navigateTo('#/verify-email');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('d-none');
  }
}

// ===================================================
//  VERIFY EMAIL
// ===================================================
function renderVerify() {
  const email = localStorage.getItem('unverified_email') || '';
  document.getElementById('verifyEmail').textContent = email;
}

async function handleSimulateVerify() {
  const email = localStorage.getItem('unverified_email');
  if (!email) return navigateTo('#/login');

  try {
    await apiFetch('/accounts/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    localStorage.removeItem('unverified_email');
    document.getElementById('loginVerifiedAlert').classList.remove('d-none');
    navigateTo('#/login');
  } catch (err) {
    alert(err.message);
  }
}

// ===================================================
//  LOGIN
// ===================================================
async function handleLogin() {
  const email    = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;
  const errEl    = document.getElementById('loginError');

  errEl.classList.add('d-none');

  try {
    const account = await apiFetch('/accounts/authenticate', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    localStorage.setItem('auth_token', account.token);
    localStorage.setItem('current_user', JSON.stringify(account));
    setAuthState(true, account);

    document.getElementById('loginEmail').value    = '';
    document.getElementById('loginPassword').value = '';
    navigateTo('#/profile');
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('d-none');
  }
}

// ===================================================
//  PROFILE
// ===================================================
function renderProfile() {
  if (!currentUser) return;

  document.getElementById('profileFullName').textContent =
    currentUser.firstName + ' ' + currentUser.lastName;
  document.getElementById('profileEmail').textContent = currentUser.email;
  document.getElementById('profileRole').textContent =
    currentUser.role === 'admin' ? 'Admin' : 'User';

  const oldBtn = document.getElementById('editProfileBtn');
  const newBtn = oldBtn.cloneNode(true);
  oldBtn.parentNode.replaceChild(newBtn, oldBtn);
  newBtn.addEventListener('click', () => {
    alert('Edit profile – coming soon!');
  });
}

// ===================================================
//  EMPLOYEES
// ===================================================
async function renderEmployees() {
  try {
    const employees = await apiFetch('/employees');
    const accounts  = await apiFetch('/accounts');
    const tbody     = document.getElementById('employeeTableBody');

    tbody.innerHTML = employees.length === 0
      ? '<tr><td colspan="5" class="text-center text-muted fst-italic">No employees yet.</td></tr>'
      : employees.map(e => {
          const acct = accounts.find(a => a.email === e.email);
          const displayName = acct
            ? `${acct.firstName} ${acct.lastName} (${e.email})`
            : e.email;
          return `
          <tr>
            <td>${e.employeeId}</td>
            <td>${displayName}</td>
            <td>${e.position}</td>
            <td>${e.dept}</td>
            <td>
              <button class="btn btn-sm btn-outline-primary me-1"
                      onclick="editEmployee(${e.id})">Edit</button>
              <button class="btn btn-sm btn-outline-danger"
                      onclick="deleteEmployee(${e.id})">Delete</button>
            </td>
          </tr>`;
        }).join('');

    await syncDeptDropdown();
  } catch (err) {
    console.error(err);
  }
}

async function syncDeptDropdown() {
  const sel = document.getElementById('empDept');
  try {
    const depts = await apiFetch('/departments');
    sel.innerHTML = depts.map(d =>
      `<option value="${d.name}">${d.name}</option>`
    ).join('');
  } catch (err) {
    console.error(err);
  }
}

let editingEmployeeId = -1;

function openEmployeeForm(emp = null) {
  editingEmployeeId = emp ? emp.id : -1;
  document.getElementById('empId').value       = emp ? emp.employeeId : '';
  document.getElementById('empEmail').value    = emp ? emp.email      : '';
  document.getElementById('empPosition').value = emp ? emp.position   : '';
  document.getElementById('empDept').value     = emp ? emp.dept       : '';
  document.getElementById('empHireDate').value = emp ? emp.hireDate   : '';
  document.getElementById('empEmailError').classList.add('d-none');
  document.getElementById('employeeFormCard').classList.remove('d-none');
  syncDeptDropdown();
}

function resetEmployeeForm() {
  editingEmployeeId = -1;
  document.getElementById('employeeFormCard').classList.add('d-none');
}

async function saveEmployee() {
  const body = {
    employeeId: document.getElementById('empId').value.trim(),
    email:      document.getElementById('empEmail').value.trim(),
    position:   document.getElementById('empPosition').value.trim(),
    dept:       document.getElementById('empDept').value,
    hireDate:   document.getElementById('empHireDate').value,
  };

  if (!body.employeeId || !body.email || !body.position) {
    return alert('Employee ID, Email, and Position are required.');
  }

  try {
    if (editingEmployeeId >= 0) {
      await apiFetch(`/employees/${editingEmployeeId}`, {
        method: 'PUT', body: JSON.stringify(body)
      });
    } else {
      await apiFetch('/employees', {
        method: 'POST', body: JSON.stringify(body)
      });
    }
    resetEmployeeForm();
    renderEmployees();
  } catch (err) {
    const errEl = document.getElementById('empEmailError');
    errEl.textContent = err.message;
    errEl.classList.remove('d-none');
  }
}

async function editEmployee(id) {
  try {
    const employees = await apiFetch('/employees');
    const emp = employees.find(e => e.id === id);
    if (emp) openEmployeeForm(emp);
  } catch (err) {
    console.error(err);
  }
}

async function deleteEmployee(id) {
  if (!confirm('Delete this employee record?')) return;
  try {
    await apiFetch(`/employees/${id}`, { method: 'DELETE' });
    renderEmployees();
  } catch (err) {
    alert(err.message);
  }
}

// ===================================================
//  DEPARTMENTS
// ===================================================
async function renderDepartments() {
  try {
    const depts = await apiFetch('/departments');
    const tbody = document.getElementById('deptTableBody');

    tbody.innerHTML = depts.length === 0
      ? '<tr><td colspan="3" class="text-center text-muted fst-italic">No departments yet.</td></tr>'
      : depts.map(d => `
        <tr>
          <td>${d.name}</td>
          <td>${d.description || '<span class="text-muted">—</span>'}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1"
                    onclick="editDept(${d.id})">Edit</button>
            <button class="btn btn-sm btn-outline-danger"
                    onclick="deleteDept(${d.id})">Delete</button>
          </td>
        </tr>`).join('');
  } catch (err) {
    console.error(err);
  }
}

let editingDeptId = -1;

function openDeptForm(dept = null) {
  editingDeptId = dept ? dept.id : -1;
  document.getElementById('deptName').value = dept ? dept.name        : '';
  document.getElementById('deptDesc').value = dept ? dept.description : '';
  document.getElementById('deptNameError').classList.add('d-none');
  document.getElementById('deptFormCard').classList.remove('d-none');
}

function closeDeptForm() {
  editingDeptId = -1;
  document.getElementById('deptFormCard').classList.add('d-none');
}

async function saveDept() {
  const body = {
    name:        document.getElementById('deptName').value.trim(),
    description: document.getElementById('deptDesc').value.trim(),
  };

  if (!body.name) {
    const errEl = document.getElementById('deptNameError');
    errEl.textContent = 'Department name is required.';
    errEl.classList.remove('d-none');
    return;
  }

  try {
    if (editingDeptId >= 0) {
      await apiFetch(`/departments/${editingDeptId}`, {
        method: 'PUT', body: JSON.stringify(body)
      });
    } else {
      await apiFetch('/departments', {
        method: 'POST', body: JSON.stringify(body)
      });
    }
    closeDeptForm();
    renderDepartments();
    syncDeptDropdown();
  } catch (err) {
    const errEl = document.getElementById('deptNameError');
    errEl.textContent = err.message;
    errEl.classList.remove('d-none');
  }
}

async function editDept(id) {
  try {
    const depts = await apiFetch('/departments');
    const dept  = depts.find(d => d.id === id);
    if (dept) openDeptForm(dept);
  } catch (err) {
    console.error(err);
  }
}

async function deleteDept(id) {
  if (!confirm('Delete this department?')) return;
  try {
    await apiFetch(`/departments/${id}`, { method: 'DELETE' });
    renderDepartments();
    syncDeptDropdown();
  } catch (err) {
    alert(err.message);
  }
}

// ===================================================
//  ACCOUNTS
// ===================================================
async function renderAccounts() {
  try {
    const accounts = await apiFetch('/accounts');
    const tbody    = document.getElementById('accountTableBody');

    tbody.innerHTML = accounts.map(a => `
      <tr>
        <td>${a.firstName} ${a.lastName}</td>
        <td>${a.email}</td>
        <td>
          <span class="badge ${a.role === 'admin' ? 'bg-danger' : 'bg-secondary'}">
            ${a.role === 'admin' ? 'Admin' : 'User'}
          </span>
        </td>
        <td class="text-center">${a.verified ? '✅' : '—'}</td>
        <td>
          <button class="btn btn-sm btn-outline-primary me-1"
                  onclick="editAccount(${a.id})">Edit</button>
          <button class="btn btn-sm btn-outline-warning me-1"
                  onclick="resetPassword(${a.id})">Reset PW</button>
          <button class="btn btn-sm btn-outline-danger"
                  onclick="deleteAccount(${a.id})">Delete</button>
        </td>
      </tr>`).join('');
  } catch (err) {
    console.error(err);
  }
}

let editingAccountId = -1;

function openAccountForm(acc = null) {
  editingAccountId = acc ? acc.id : -1;
  document.getElementById('accFirstName').value  = acc ? acc.firstName : '';
  document.getElementById('accLastName').value   = acc ? acc.lastName  : '';
  document.getElementById('accEmail').value      = acc ? acc.email     : '';
  document.getElementById('accPassword').value   = '';
  document.getElementById('accRole').value       = acc ? acc.role      : 'user';
  document.getElementById('accVerified').checked = acc ? acc.verified  : false;
  document.getElementById('accFormError').classList.add('d-none');
  document.getElementById('accPasswordHint').classList.toggle('d-none', editingAccountId === -1);
  document.getElementById('accountFormCard').classList.remove('d-none');
}

function closeAccountForm() {
  editingAccountId = -1;
  document.getElementById('accountFormCard').classList.add('d-none');
}

async function saveAccount() {
  const errEl    = document.getElementById('accFormError');
  errEl.classList.add('d-none');

  const firstName = document.getElementById('accFirstName').value.trim();
  const lastName  = document.getElementById('accLastName').value.trim();
  const email     = document.getElementById('accEmail').value.trim();
  const password  = document.getElementById('accPassword').value;
  const role      = document.getElementById('accRole').value;
  const verified  = document.getElementById('accVerified').checked;

  if (!firstName || !lastName || !email) {
    errEl.textContent = 'First name, last name, and email are required.';
    errEl.classList.remove('d-none');
    return;
  }
  if (editingAccountId === -1 && !password) {
    errEl.textContent = 'Password is required for new accounts.';
    errEl.classList.remove('d-none');
    return;
  }

  try {
    if (editingAccountId >= 0) {
      const body = { firstName, lastName, email, role, verified,
        ...(password ? { password } : {}) };
      await apiFetch(`/accounts/${editingAccountId}`, {
        method: 'PUT', body: JSON.stringify(body)
      });
    } else {
      await apiFetch('/accounts/register', {
        method: 'POST',
        body: JSON.stringify({ firstName, lastName, email, password, role, verified })
      });
    }
    closeAccountForm();
    renderAccounts();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('d-none');
  }
}

async function editAccount(id) {
  try {
    const accounts = await apiFetch('/accounts');
    const acc = accounts.find(a => a.id === id);
    if (acc) openAccountForm(acc);
  } catch (err) {
    console.error(err);
  }
}

async function resetPassword(id) {
  const np = prompt('Enter new password (min 6 chars):');
  if (np === null) return;
  if (np.length < 6) {
    alert('Password must be at least 6 characters.');
    return;
  }
  try {
    await apiFetch(`/accounts/${id}`, {
      method: 'PUT', body: JSON.stringify({ password: np })
    });
    alert('Password reset successfully.');
  } catch (err) {
    alert(err.message);
  }
}

async function deleteAccount(id) {
  if (currentUser && currentUser.id === id) {
    alert('You cannot delete your own account while logged in.');
    return;
  }
  if (!confirm('Delete this account?')) return;
  try {
    await apiFetch(`/accounts/${id}`, { method: 'DELETE' });
    renderAccounts();
  } catch (err) {
    alert(err.message);
  }
}

// ===================================================
//  REQUESTS
// ===================================================
function statusBadge(status) {
  const map = {
    'Pending':  'bg-warning text-dark',
    'Approved': 'bg-success',
    'Rejected': 'bg-danger',
  };
  return `<span class="badge ${map[status] || 'bg-secondary'}">${status || 'Pending'}</span>`;
}

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined,
    { year: 'numeric', month: 'short', day: 'numeric' });
}

async function renderRequests() {
  try {
    const isAdmin  = currentUser && currentUser.role === 'admin';
    const all      = await apiFetch('/requests');
    const requests = isAdmin
      ? all
      : all.filter(r => r.employeeEmail === currentUser?.email);

    const emptyDiv  = document.getElementById('requestsEmpty');
    const table     = document.getElementById('requestsTable');
    const tbody     = document.getElementById('requestTableBody');
    const heading   = document.getElementById('requestsHeading');
    const newBtn    = document.getElementById('newRequestBtn');
    const createBtn = document.getElementById('createOneBtn');

    if (isAdmin) {
      heading.textContent = 'All Requests';
      newBtn.classList.add('d-none');
      createBtn.classList.add('d-none');
    } else {
      heading.textContent = 'My Requests';
      newBtn.classList.remove('d-none');
      createBtn.classList.remove('d-none');
    }

    const tableHead = document.querySelector('#requestsTable thead tr');
    if (isAdmin && !tableHead.querySelector('.submitter-col')) {
      const th = document.createElement('th');
      th.className = 'submitter-col';
      th.textContent = 'Submitter';
      tableHead.insertBefore(th, tableHead.children[1]);
    } else if (!isAdmin) {
      const col = tableHead.querySelector('.submitter-col');
      if (col) col.remove();
    }

    if (requests.length === 0) {
      emptyDiv.style.display = '';
      table.classList.add('d-none');
      document.getElementById('requestsEmptyText').textContent =
        isAdmin ? 'No requests submitted yet.' : 'You have no requests yet.';
      return;
    }

    emptyDiv.style.display = 'none';
    table.classList.remove('d-none');

    const accounts = await apiFetch('/accounts');
    const sorted   = [...requests].sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = sorted.map(r => {
      const items = JSON.parse(r.items);
      const itemsSummary = items
        .map(it => `${it.name} <span class="text-muted">×${it.qty}</span>`)
        .join(', ');

      const submitter = accounts.find(a => a.email === r.employeeEmail);
      const submitterName = submitter
        ? `${submitter.firstName} ${submitter.lastName}`
        : r.employeeEmail;

      let actionButtons = '';
      if (isAdmin) {
        if (r.status === 'Pending') {
          actionButtons = `
            <button class="btn btn-sm btn-success me-1"
                    onclick="approveRequest(${r.id})">Approve</button>
            <button class="btn btn-sm btn-danger"
                    onclick="rejectRequest(${r.id})">Reject</button>`;
        } else {
          actionButtons = `<span class="text-muted small fst-italic">${r.status}</span>`;
        }
      } else {
        actionButtons = `
          <button class="btn btn-sm btn-outline-danger"
                  onclick="deleteRequest(${r.id})">Delete</button>`;
      }

      return `
        <tr>
          <td class="text-nowrap">${fmtDate(r.date)}</td>
          ${isAdmin ? `<td>${submitterName}</td>` : ''}
          <td>${r.type}</td>
          <td class="req-items-cell">${itemsSummary}</td>
          <td class="text-center">${statusBadge(r.status)}</td>
          <td class="text-nowrap">${actionButtons}</td>
        </tr>`;
    }).join('');
  } catch (err) {
    console.error(err);
  }
}

function openRequestModal() {
  document.getElementById('reqError').classList.add('d-none');
  document.getElementById('reqType').value = 'Equipment';
  buildReqItems([{ name: '', qty: 1 }]);
  requestModal.show();
}

function buildReqItems(items) {
  const container = document.getElementById('reqItemsList');
  container.innerHTML = '';
  items.forEach(it => {
    const row = document.createElement('div');
    row.className = 'input-group mb-2 req-item-row';
    row.innerHTML = `
      <input type="text" class="form-control req-item-name"
             placeholder="Item name" value="${it.name}">
      <input type="number" class="form-control req-item-qty"
             style="max-width:90px" min="1" value="${it.qty}">
      <button type="button" class="btn btn-outline-danger req-remove-btn"
              onclick="removeReqItem(this)" title="Remove">×</button>`;
    container.appendChild(row);
  });
}

function addReqItem() {
  const rows  = document.querySelectorAll('.req-item-row');
  const items = [...rows].map(row => ({
    name: row.querySelector('.req-item-name').value,
    qty:  row.querySelector('.req-item-qty').value,
  }));
  items.push({ name: '', qty: 1 });
  buildReqItems(items);
  const allNames = document.querySelectorAll('.req-item-name');
  allNames[allNames.length - 1].focus();
}

function removeReqItem(btn) {
  const row     = btn.closest('.req-item-row');
  const allRows = document.querySelectorAll('.req-item-row');
  if (allRows.length === 1) {
    row.querySelector('.req-item-name').value = '';
    row.querySelector('.req-item-qty').value  = 1;
    return;
  }
  row.remove();
}

async function submitRequest() {
  const errEl = document.getElementById('reqError');
  errEl.classList.add('d-none');

  const type  = document.getElementById('reqType').value;
  const rows  = document.querySelectorAll('.req-item-row');
  const items = [...rows]
    .map(row => ({
      name: row.querySelector('.req-item-name').value.trim(),
      qty:  parseInt(row.querySelector('.req-item-qty').value) || 1,
    }))
    .filter(it => it.name !== '');

  if (items.length === 0) {
    errEl.textContent = 'Please add at least one item before submitting.';
    errEl.classList.remove('d-none');
    return;
  }

  try {
    await apiFetch('/requests', {
      method: 'POST',
      body: JSON.stringify({
        employeeEmail: currentUser.email,
        type,
        items: JSON.stringify(items),
        status: 'Pending',
        date: new Date().toISOString()
      })
    });
    requestModal.hide();
    renderRequests();
  } catch (err) {
    errEl.textContent = err.message;
    errEl.classList.remove('d-none');
  }
}

async function deleteRequest(id) {
  if (!confirm('Delete this request?')) return;
  try {
    await apiFetch(`/requests/${id}`, { method: 'DELETE' });
    renderRequests();
  } catch (err) {
    alert(err.message);
  }
}

async function approveRequest(id) {
  if (!confirm('Approve this request?')) return;
  try {
    await apiFetch(`/requests/${id}`, {
      method: 'PUT', body: JSON.stringify({ status: 'Approved' })
    });
    renderRequests();
  } catch (err) {
    alert(err.message);
  }
}

async function rejectRequest(id) {
  if (!confirm('Reject this request?')) return;
  try {
    await apiFetch(`/requests/${id}`, {
      method: 'PUT', body: JSON.stringify({ status: 'Rejected' })
    });
    renderRequests();
  } catch (err) {
    alert(err.message);
  }
}