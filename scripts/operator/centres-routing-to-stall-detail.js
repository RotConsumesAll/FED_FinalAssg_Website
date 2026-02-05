export function redirectToStallDetailPage(e, centreId, stallId) {
  window.location.href = `./operator_stall_detail.html?centreId=${centreId}&stallId=${stallId}`;
}
