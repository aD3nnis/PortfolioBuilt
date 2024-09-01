gsap.registerPlugin(ScrollTrigger);
let sections = gsap.utils.toArray(".slide");
// const totalWidth = sections.reduce((acc, section) => {
//     return acc + section.getBoundingClientRect().width;
//   }, 0);
let viewportWidth = window.innerWidth;
console.log("Number of sections:", sections.length);
console.log("inner",viewportWidth )
console.log("math", viewportWidth/1000)
gsap.to(sections, {
  xPercent: -100 * (sections.length) + ((viewportWidth/1000) * 100),
  ease: "none",
  scrollTrigger: {
    trigger: "#iframeId",
    pin: ".pinned-elements",
    start: 'top top',
    pinSpacing: false,
    scrub: 1,
    end: `+=3000px bottom`,
    markers: {
        startColor: "transparent",
        endColor: "transparent",
    },
    onUpdate: (self) => {
        // Remove any unexpected top adjustments
        if (self.pin) {
          self.pin.style.top = "0px";
        }
      }
  }
});