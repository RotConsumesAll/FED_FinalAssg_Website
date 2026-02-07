export function redirectToStallDetailPage(e, centreId, stallId) {
  window.location.href = `./stall_detail.html?centreId=${centreId}&stallId=${stallId}`;
}
