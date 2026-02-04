const container = document.getElementById("stall-container");

// Made with reference to https://youtu.be/3NG8zy0ywIk
export function keyUpHandler(e) {
  const searchTerm = e.currentTarget.value.toLowerCase();
  if (searchTerm === null) return;

  const stalls = container.getElementsByTagName("article");
  Array.from(stalls).forEach(function (stall) {
    const name = stall.querySelector("h2").textContent.toLowerCase();
    const owner = stall
      .querySelector(".stall-card__name-and-owner__name")
      .textContent.toLowerCase();
    if (name.includes(searchTerm) || owner.includes(searchTerm)) {
      stall.style.display = "flex";
    } else {
      stall.style.display = "none";
    }
  });
}

export function assignSearchBarHandler() {
  document
    .querySelector("#centre-search")
    .addEventListener("keyup", keyUpHandler);
}
