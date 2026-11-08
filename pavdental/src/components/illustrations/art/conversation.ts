// Custom, drawn to match the Streamline "New York" set (flat fills, heavy
// outline, brand tokens). Two people talking: Messages and the clinician inbox.
export default '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 154 154">' +
  // speech bubble, patient side
  '<path d="M30 20h50a14 14 0 0 1 14 14v14a14 14 0 0 1-14 14H46l-12 10 3-10h-7a14 14 0 0 1-14-14V34a14 14 0 0 1 14-14z" fill="{accent}" stroke="{line}" stroke-width="2.5" stroke-linejoin="round"/>' +
  '<circle cx="40" cy="41" r="3.5" fill="{line}"/><circle cx="55" cy="41" r="3.5" fill="{line}"/><circle cx="70" cy="41" r="3.5" fill="{line}"/>' +
  // reply bubble, practice side
  '<path d="M82 52h44a12 12 0 0 1 12 12v12a12 12 0 0 1-12 12h-4l3 9-11-9H82a12 12 0 0 1-12-12V64a12 12 0 0 1 12-12z" fill="{paper}" stroke="{line}" stroke-width="2.5" stroke-linejoin="round"/>' +
  '<path d="M82 66h40M82 75h26" stroke="{line}" stroke-width="2.5" stroke-linecap="round"/>' +
  // sparkle lines
  '<path d="M10 22l6 4M8 34h7M128 36l6-5M132 46h8" stroke="{line}" stroke-width="2" stroke-linecap="round"/>' +
  // left person
  '<path d="M16 150c0-22 10-34 26-34s26 12 26 34z" fill="{deep}" stroke="{line}" stroke-width="2.5" stroke-linejoin="round"/>' +
  '<circle cx="42" cy="100" r="13" fill="{skinMid}" stroke="{line}" stroke-width="2.5"/>' +
  '<path d="M29 99c0-10 6-15 13-15 9 0 14 6 13 13-5-1-9-4-11-8-3 5-8 8-15 10z" fill="{line}"/>' +
  '<path d="M40 128l-6 22M44 128l6 22" stroke="{sage}" stroke-width="2.5" stroke-linecap="round"/>' +
  // right person
  '<path d="M86 150c0-20 10-31 26-31s26 11 26 31z" fill="{sun}" stroke="{line}" stroke-width="2.5" stroke-linejoin="round"/>' +
  '<circle cx="112" cy="104" r="13" fill="{skinLight}" stroke="{line}" stroke-width="2.5"/>' +
  '<path d="M99 103c-1-12 6-17 13-17 8 0 14 5 14 13l-4 1c0-5-3-8-6-9-4 4-10 7-17 12z" fill="{skinDeep}" stroke="{line}" stroke-width="2"/>' +
  '<circle cx="108" cy="105" r="1.6" fill="{line}"/><circle cx="117" cy="105" r="1.6" fill="{line}"/>' +
  // ground
  '<path d="M6 150h142" stroke="{line}" stroke-width="2.5" stroke-linecap="round"/>' +
  "</svg>";
