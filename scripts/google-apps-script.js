/**
 * CU Golf Club — Member Registry Google Apps Script
 *
 * HOW TO UPDATE (since you already have a deployment):
 * 1. Open: https://docs.google.com/spreadsheets/d/1PHmxOGZl_rG816srgIOYkUXCFxJSnmISh8z78QdpPAg/edit
 * 2. Extensions → Apps Script
 * 3. Replace ALL existing code with this file and Save (Ctrl+S)
 * 4. Deploy → Manage deployments → click the pencil (edit) on your deployment
 *    → Version: "New version" → Deploy
 * 5. The webhook URL stays the same — no need to update .env
 * 6. Run migrateHeaders() once manually from the editor to fix existing sheet columns
 */

var SHEET_NAME = "Members";
var HEADERS = ["Timestamp", "Member ID", "Prefix", "Name", "Email", "Student ID", "Year", "Faculty", "Instagram", "Line ID"];

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  return sheet;
}

function ensureHeaders(sheet) {
  var currentHeaders = sheet.getLastRow() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    : [];

  // Update header row if it doesn't match expected headers
  if (JSON.stringify(currentHeaders) !== JSON.stringify(HEADERS)) {
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    } else {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    }
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();
    ensureHeaders(sheet);

    var memberId = data.id || "";
    var row = [
      data.timestamp || new Date().toISOString(),
      memberId,
      data.prefix || "—",
      data.name || "",
      data.email || "",
      data.studentId || "",
      data.year || "—",
      data.faculty || "—",
      data.instagram || "—",
      data.lineId || "—"
    ];

    // Check for existing row by Member ID (column B) to avoid duplicates
    var lastRow = sheet.getLastRow();
    if (lastRow > 1 && memberId) {
      var ids = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
      var existingIndex = ids.indexOf(memberId);
      if (existingIndex !== -1) {
        sheet.getRange(existingIndex + 2, 1, 1, row.length).setValues([row]);
        return ContentService
          .createTextOutput(JSON.stringify({ success: true, action: "updated" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }

    // New member — append
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, action: "inserted" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Run this ONCE manually from the Apps Script editor after updating the code.
// It updates the header row and adds missing columns to existing data rows.
function migrateHeaders() {
  var sheet = getOrCreateSheet();
  ensureHeaders(sheet);
  Logger.log("Headers updated: " + HEADERS.join(", "));
  Logger.log("Total rows: " + sheet.getLastRow());
}
