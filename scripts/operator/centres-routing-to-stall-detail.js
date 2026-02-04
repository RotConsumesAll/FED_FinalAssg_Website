export function redirectToStallDetailPage(e, centreName) {
  const stallName = e.currentTarget.querySelector("h2").textContent;
  window.location.href = `./operator-stall-detail.html?centreName=${centreName}&stallName=${stallName}`;
}
