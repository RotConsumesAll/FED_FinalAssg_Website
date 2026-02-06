import { db, ref, onValue, remove, auth, get } from "../firebase/index.js";
import { onAuthStateChanged } from 
  "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

const feedbackList = document.getElementById("feedbackList");
const feedbackHeader = document.querySelector(".text-menu");
const starSVG = `
<svg 
    width="25" 
    height="25" 
    viewBox="0 0 17 17"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M 8.556957244873047 13.697500228881836 L 12.70695686340332 16.207500457763672 C 13.466956853866577 16.667500466108322 14.396956637501717 15.987500548362732 14.196956634521484 15.127500534057617 L 13.09695816040039 10.407499313354492 L 16.766956329345703 7.2275004386901855 C 17.436956346035004 6.647500455379486 17.076956629753113 5.547500438988209 16.196956634521484 5.4775004386901855 L 11.366957664489746 5.067500591278076 L 9.476957321166992 0.6075000166893005 C 9.136957317590714 -0.20249998569488525 7.97695717215538 -0.20249998569488525 7.636957168579102 0.6075000166893005 L 5.746956825256348 5.05750036239624 L 0.9169574975967407 5.46750020980835 C 0.036957502365112305 5.537500210106373 -0.3230426609516144 6.63750022649765 0.34695735573768616 7.21750020980835 L 4.0169572830200195 10.397500038146973 L 2.9169576168060303 15.117500305175781 C 2.716957613825798 15.977500319480896 3.6469571590423584 16.657500237226486 4.406957149505615 16.197500228881836 L 8.556957244873047 13.697500228881836 Z" fill="#FFF700"/>
</svg>
`;

feedbackHeader.textContent = "Loading feedback...";

const startTime = Date.now();


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../index.html";
    return;
  }

  const uid = user.uid;

  const userGet = await get(ref(db, `users/${uid}`));
  if (!userGet.exists()) {
    feedbackHeader.textContent = "User profile not found";
    return;
  }

  const { stallId } = userGet.val();
  if (!stallId) {
    feedbackHeader.textContent = "No stall assigned";
    return;
  }

const feedbackRef = ref(db, `stalls/${stallId}/feedbacks`);

 const renderFeedback = (snapshot) => {
    feedbackList.innerHTML = ""; // clear previous feedback

    if (!snapshot.exists()) {
      feedbackHeader.textContent = "No feedback yet";
      return;
    } else {
      feedbackHeader.textContent = "Feedback";
    }

  const data = snapshot.val();  

    Object.values(data).forEach((feedback) => {
      const div = document.createElement("div");
      const section = document.createElement("section");
      const p = document.createElement("p");
      const span = document.createElement("span");
      div.classList.add("rectangle-6"); // white box for feedback
      section.classList.add("frame-5"); // frame for stars :D
      p.classList.add("feedback-comment");
      span.classList.add("commenter");
      
      div.appendChild(section);
      div.appendChild(p);
      div.appendChild(span);

      // adding star ratings
      for (let i = 0; i < feedback.rating; i++) {
          const temp = document.createElement("div");
          temp.innerHTML = starSVG.trim();
          section.appendChild(temp.firstChild);
      }

      // adding comments
      p.textContent = feedback.comment;


      // adding user 
      span.textContent = `— ${feedback.userName || "Anonymous"}`;


      feedbackList.appendChild(div);
    });
  };

onValue(feedbackRef, (snapshot) => {
    if (!snapshot.exists()) return;
    const elapsed = Date.now() - startTime;

  if (elapsed < 500) {
      setTimeout(() => renderFeedback(snapshot), 500 - elapsed);
      renderFeedback(snapshot);
    } 
    else {
      renderFeedback();
    }

})

// for TESTING, delete later

  const clearButton = document.createElement("button");
  clearButton.textContent = "Clear Feedbacks";
  document.body.appendChild(clearButton);

  clearButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all feedbacks?")) {
      remove(ref(db, `stalls/${stallId}/feedbacks`))
        .then(() => alert("All feedbacks cleared!"))
        .catch((err) => console.error(err));
    }
  });

  console.log(auth.currentUser);

});

