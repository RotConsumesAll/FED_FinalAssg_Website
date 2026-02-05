// Put all of your DOM interactions and event listeners
import { getHawkerCentres } from "../services/operator-service.js";

document.addEventListener("DOMContentLoaded", (e) => {
  document
    .getElementById("refresh-hawker-centres")
    .addEventListener("click", (e) => {
      getHawkerCentres();
    });
});
