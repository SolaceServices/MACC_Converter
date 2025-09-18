let csvFile = null;
let jsonData = null;

const csvPanel = document.getElementById("csvPanel");
const fileInput = document.getElementById("fileInput");
const uploadState = document.getElementById("uploadState");
const fileState = document.getElementById("fileState");
const fileName = document.getElementById("fileName");
const fileSize = document.getElementById("fileSize");
const progressBar = document.getElementById("progressBar");
const emptyState = document.getElementById("emptyState");
const jsonPreview = document.getElementById("jsonPreview");
const jsonCode = document.getElementById("jsonCode");
const downloadSection = document.getElementById("downloadSection");
const errorMessage = document.getElementById("errorMessage");

// Drag and drop handlers
csvPanel.addEventListener("dragover", (e) => {
  e.preventDefault();
  csvPanel.classList.add("drag-over");
});

csvPanel.addEventListener("dragleave", (e) => {
  e.preventDefault();
  csvPanel.classList.remove("drag-over");
});

csvPanel.addEventListener("drop", (e) => {
  e.preventDefault();
  csvPanel.classList.remove("drag-over");
  if (e.dataTransfer.files.length > 0) {
    handleFileSelect(e.dataTransfer.files[0]);
  }
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleFileSelect(e.target.files[0]);
  }
});

function handleFileSelect(file) {
  if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
    showError("Please select a valid CSV file");
    return;
  }

  hideError();
  csvFile = file;
  csvPanel.classList.add("file-uploaded");
  uploadState.classList.add("hidden");
  fileState.classList.remove("hidden");
  fileName.textContent = file.name;
  fileSize.textContent = (file.size / 1024).toFixed(1) + " KB";

  processCSV(file);
}

function processCSV(file) {
  progressBar.classList.remove("hidden");

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      progressBar.classList.add("hidden");

      if (!results.data || results.data.length === 0) {
        showError("CSV contains no data");
        return;
      }

      jsonData = results.data.map((row) => ({
        email: row["Email"] || "",
        email_verified: false,
        given_name: row["Firstname"] || "",
        family_name: row["Lastname"] || "",
        name: `${row["Firstname"] || ""} ${row["Lastname"] || ""}`.trim(),
        nickname: row["Firstname"] || "",
        password: row["Password"] || "",
        app_metadata: {
          branch_name: row["Branch Name"] || "",
          branch_name_path: row["Branch Name Path"] || "",
          level: row["Level"] || "user",
        },
        user_metadata: {
          language: row["Language"] || "english",
          timezone: row["Timezone"] || "America/Chicago",
        },
      }));

      displayJSON(jsonData);
    },
    error: function (err) {
      progressBar.classList.add("hidden");
      showError(err.message || "Error parsing CSV");
    },
  });
}

function displayJSON(data) {
  emptyState.classList.add("hidden");
  jsonPreview.classList.remove("hidden");
  downloadSection.classList.remove("hidden");

  let jsonString = JSON.stringify(data, null, 2);

  jsonCode.textContent = jsonString;
}

function downloadJSON() {
  if (!jsonData) return;

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = csvFile?.name.replace(".csv", ".json") || "converted.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}

function hideError() {
  errorMessage.classList.add("hidden");
}
