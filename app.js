// app.js

let budgetData = {
    totalBudget: 0,
    needs: 0,
    wants: 0,
    savings: 0,
    expenses: []
};

// Load saved data from localStorage on startup
window.onload = function () {
    const saved = localStorage.getItem("budgetData");
    if (saved) {
        budgetData = JSON.parse(saved);
        updateUI();
    }
};

// Tab Switching Logic
function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });

  document.querySelectorAll('.tab').forEach(button => {
    button.classList.remove('active');
  });

  document.getElementById(tabId + '-tab').classList.add('active');
}

// --- BUDGET LOGIC ---
function updateSplit() {
    const input = document.getElementById("master-budget");
    const rawValue = input.value.trim();

    if (!rawValue || isNaN(rawValue) || Number(rawValue) <= 0) {
        alert("Please enter a valid positive number for the budget.");
        return;
    }

    const total = parseFloat(rawValue);
    budgetData.totalBudget = total;
    budgetData.needs = total * 0.4;
    budgetData.wants = total * 0.3;
    budgetData.savings = total * 0.3;

    // Save to localStorage
    saveToLocalStorage();

    updateUI();
}

// --- UPDATE UI VALUES ---
function updateUI() {
    document.getElementById("needs-amount").textContent = budgetData.needs.toFixed(2);
    document.getElementById("wants-amount").textContent = budgetData.wants.toFixed(2);
    document.getElementById("savings-amount").textContent = budgetData.savings.toFixed(2);

    renderExpenseLog();
}

// --- EXPENSE LOGIC ---
function addExpense() {
    const amountInput = document.getElementById("expense-amount");
    const categorySelect = document.getElementById("expense-category");
    const descInput = document.getElementById("expense-desc");

    const amount = parseFloat(amountInput.value);
    const category = categorySelect.value;
    const description = descInput.value.trim();

    if (!amount || isNaN(amount) || amount <= 0) {
        alert("Please enter a valid positive amount.");
        return;
    }

    if (!description) {
        alert("Please enter a short description.");
        return;
    }

    // Deduct from corresponding category
    if (budgetData[category] < amount) {
        alert(`You don't have enough funds in "${category}" category.`);
        return;
    }

    budgetData[category] -= amount;

    // Create expense object
    const expense = {
        amount,
        category,
        description,
        timestamp: new Date().toLocaleDateString()
    };

    // Add to expense log
    budgetData.expenses.unshift(expense); // Add to top

    // Clear inputs
    amountInput.value = "";
    descInput.value = "";

    // Save and update UI
    saveToLocalStorage();
    updateUI();
}

// --- RENDER EXPENSE LOG ---
function renderExpenseLog() {
    const logList = document.getElementById("log-list");
    logList.innerHTML = ""; // Clear existing list

    if (budgetData.expenses.length === 0) {
        logList.innerHTML = "<li>No expenses yet.</li>";
        return;
    }

    budgetData.expenses.forEach(expense => {
        const li = document.createElement("li");
        li.textContent = `[${expense.timestamp}] ${capitalizeFirstLetter(expense.category)} → ${expense.description} = ₹${expense.amount}`;
        logList.appendChild(li);
    });
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// --- EXPORT DATA AS .TXT FILE ---
function exportData() {
  let content = "=== BUDGET TRACKER EXPORT ===\n\n";
  content += `Master Budget: ₹${budgetData.totalBudget.toFixed(2)}\n`;
  content += `Needs Left: ₹${budgetData.needs.toFixed(2)}\n`;
  content += `Wants Left: ₹${budgetData.wants.toFixed(2)}\n`;
  content += `Savings Left: ₹${budgetData.savings.toFixed(2)}\n\n`;
  content += "=== EXPENSE LOG ===\n";

  if (budgetData.expenses.length === 0) {
    content += "No expenses recorded.\n";
  } else {
    budgetData.expenses.forEach(expense => {
      content += `[${expense.timestamp}] ${capitalizeFirstLetter(expense.category)} → ${expense.description} = ₹${expense.amount}\n`;
    });
  }

  // Create blob and download
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `budget_export_${new Date().toISOString().slice(0,10)}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

// --- RESET FUNCTION ---
function resetApp() {
  if (confirm("Are you sure you want to reset all data? This action cannot be undone.")) {
    // Optional: Prompt export before reset
    if (confirm("Would you like to export your current data before resetting?")) {
      exportData(); // ✅ Calls the globally defined exportData()
    }

    // Reset budgetData
    budgetData = {
      totalBudget: 0,
      needs: 0,
      wants: 0,
      savings: 0,
      expenses: []
    };

    saveToLocalStorage();
    updateUI();
  }
}

// --- MODAL FUNCTIONS ---
function openExpenseModal() {
  const modal = document.getElementById("expense-modal");
  const content = modal.querySelector(".modal-content");

  modal.style.display = "block";
  requestAnimationFrame(() => {
    content.classList.add("show");
  });
}

function closeExpenseModal() {
  const modal = document.getElementById("expense-modal");
  const content = modal.querySelector(".modal-content");

  content.classList.remove("show");

  setTimeout(() => {
    modal.style.display = "none";
  }, 300); // Match transition duration
}

function addExpenseFromModal() {
  const amount = parseFloat(document.getElementById("modal-amount").value);
  const category = document.getElementById("modal-category").value;
  const description = document.getElementById("modal-desc").value.trim();

  if (!amount || isNaN(amount) || amount <= 0) {
    alert("Please enter a valid positive amount.");
    return;
  }

  if (!description) {
    alert("Please enter a short description.");
    return;
  }

  // Deduct from corresponding category
  if (budgetData[category] < amount) {
    alert(`You don't have enough funds in "${category}" category.`);
    return;
  }

  budgetData[category] -= amount;

  // Create expense object
  const expense = {
    amount,
    category,
    description,
    timestamp: new Date().toLocaleDateString()
  };

  // Add to expense log
  budgetData.expenses.unshift(expense); // Add to top

  // Clear inputs
  document.getElementById("modal-amount").value = "";
  document.getElementById("modal-desc").value = "";

  // Save and update UI
  saveToLocalStorage();
  updateUI();
  closeExpenseModal();
}

// Optional: Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById("expense-modal");
  if (event.target == modal) {
    closeExpenseModal();
  }
};

// --- SAVE TO LOCAL STORAGE ---
function saveToLocalStorage() {
    localStorage.setItem("budgetData", JSON.stringify(budgetData));
}

// --- REGISTER SERVICE WORKER ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

