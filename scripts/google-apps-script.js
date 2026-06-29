/**
 * CU Golf Club — Member Registry Google Apps Script
 *
 * HOW TO DEPLOY:
 * 1. Open the target spreadsheet:
 *    https://docs.google.com/spreadsheets/d/1PHmxOGZl_rG816srgIOYkUXCFxJSnmISh8z78QdpPAg/edit
 * 2. Click Extensions → Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Save (Ctrl+S)
 * 5. Click Deploy → New deployment → Type: Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Click Deploy, authorize when prompted
 * 7. Copy the Web App URL and set it as GOOGLE_SHEETS_WEBHOOK_URL in your .env file
 *
 * The script receives POST requests from the server (on every new registration
 * and on the daily scheduled sync) and writes each member as a row in the
 * "Members" sheet, deduplicating by member ID.
 */

var SHEET_NAME = "Members";
var HEADERS = ["Timestamp", "Member ID", "Name", "Email", "Student ID", "Year", "Faculty"];

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  // Ensure headers are present
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = getOrCreateSheet();

    var memberId = data.id || "";
    var row = [
      data.timestamp || new Date().toISOString(),
      memberId,
      data.name || "",
      data.email || "",
      data.studentId || "",
      data.year || "—",
      data.faculty || "—"
    ];

    // Check for existing row by Member ID (column B = index 2) to avoid duplicates
    var lastRow = sheet.getLastRow();
    if (lastRow > 1 && memberId) {
      var ids = sheet.getRange(2, 2, lastRow - 1, 1).getValues().flat();
      var existingIndex = ids.indexOf(memberId);
      if (existingIndex !== -1) {
        // Update existing row (existingIndex is 0-based; row 1 is header)
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

// Optional: run this manually to test the sheet setup
function testSetup() {
  var sheet = getOrCreateSheet();
  Logger.log("Sheet ready: " + sheet.getName() + ", rows: " + sheet.getLastRow());
}
