const EXERCISES = [
  {
    id: "barbell-bench-press",
    name: "Barbell Bench Press",
    equipment: "barbell",
    level: "intermediate",
    primary: "chest",
    secondary: ["triceps", "front-delt"],
    pattern: "press-h",
    steps: [
      "Set up on the bench with feet planted, shoulder blades pinched, and a slight arch in your back.",
      "Unrack and lower the weight with control to mid-chest, elbows about 45° from your torso.",
      "Press up explosively without bouncing, keeping your wrists stacked over your elbows.",
      "Lock out softly at the top, then repeat. Exhale on the press."
    ]
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "chest",
    secondary: ["triceps", "front-delt"],
    pattern: "press-h",
    steps: [
      "Set up on the bench with feet planted, shoulder blades pinched, and a slight arch in your back.",
      "Unrack and lower the weight with control to mid-chest, elbows about 45° from your torso.",
      "Press up explosively without bouncing, keeping your wrists stacked over your elbows.",
      "Lock out softly at the top, then repeat. Exhale on the press."
    ]
  },
  {
    id: "push-up",
    name: "Push-Up",
    equipment: "bodyweight",
    level: "beginner",
    primary: "chest",
    secondary: ["triceps", "front-delt"],
    pattern: "pushup",
    steps: [
      "Start in a high plank: hands under shoulders, body in one straight line, glutes squeezed.",
      "Lower your chest toward the floor with elbows at ~45°, keeping your core braced.",
      "Push the floor away to return to the top without sagging at the hips.",
      "Keep your neck neutral and breathe in on the way down, out on the way up."
    ]
  },
  {
    id: "incline-barbell-press",
    name: "Incline Barbell Press",
    equipment: "barbell",
    level: "intermediate",
    primary: "chest",
    secondary: ["triceps"],
    pattern: "press-h",
    steps: [
      "Set up on the bench with feet planted, shoulder blades pinched, and a slight arch in your back.",
      "Unrack and lower the weight with control to mid-chest, elbows about 45° from your torso.",
      "Press up explosively without bouncing, keeping your wrists stacked over your elbows.",
      "Lock out softly at the top, then repeat. Exhale on the press."
    ]
  },
  {
    id: "dumbbell-fly",
    name: "Dumbbell Fly",
    equipment: "dumbbell",
    level: "beginner",
    primary: "chest",
    secondary: [],
    pattern: "fly",
    steps: [
      "Lie back with a dumbbell in each hand, arms extended above your chest with a soft bend in the elbows.",
      "Open your arms wide in an arc until you feel a deep stretch across your chest.",
      "Squeeze your pecs to bring the weights back together over your chest.",
      "Keep the elbow angle fixed. This is a chest isolation move, not a press."
    ]
  },
  {
    id: "cable-crossover",
    name: "Cable Crossover",
    equipment: "cable",
    level: "intermediate",
    primary: "chest",
    secondary: [],
    pattern: "cable-fly",
    steps: [
      "Stand centered between the pulleys with handles at shoulder height, one foot forward.",
      "Step forward and bring your hands together in front of your chest in a hugging motion.",
      "Squeeze hard for a second at full contraction.",
      "Control the return until you feel a stretch, then repeat."
    ]
  },
  {
    id: "decline-bench-press",
    name: "Decline Bench Press",
    equipment: "barbell",
    level: "intermediate",
    primary: "chest",
    secondary: ["triceps"],
    pattern: "press-h",
    steps: [
      "Set up on the bench with feet planted, shoulder blades pinched, and a slight arch in your back.",
      "Unrack and lower the weight with control to mid-chest, elbows about 45° from your torso.",
      "Press up explosively without bouncing, keeping your wrists stacked over your elbows.",
      "Lock out softly at the top, then repeat. Exhale on the press."
    ]
  },
  {
    id: "chest-dip",
    name: "Chest Dip",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "chest",
    secondary: ["triceps"],
    pattern: "dip",
    steps: [
      "Grip the bars and lift yourself up, leaning slightly forward for chest or staying upright for triceps.",
      "Lower yourself with control until your shoulders are just below your elbows.",
      "Drive back up without shrugging or swinging your legs.",
      "Keep the movement strict. Add weight only once bodyweight feels easy."
    ]
  },
  {
    id: "machine-chest-press",
    name: "Machine Chest Press",
    equipment: "machine",
    level: "beginner",
    primary: "chest",
    secondary: ["triceps"],
    pattern: "machine-press",
    steps: [
      "Adjust the seat so the handles line up with mid-chest, back flat against the pad.",
      "Press the handles forward until your arms are nearly straight.",
      "Squeeze briefly, then lower slowly back to the start.",
      "Don't let the weight stack slam between reps."
    ]
  },
  {
    id: "floor-press",
    name: "Floor Press",
    equipment: "barbell",
    level: "intermediate",
    primary: "chest",
    secondary: ["triceps"],
    pattern: "press-h",
    steps: [
      "Set up on the bench with feet planted, shoulder blades pinched, and a slight arch in your back.",
      "Unrack and lower the weight with control to mid-chest, elbows about 45° from your torso.",
      "Press up explosively without bouncing, keeping your wrists stacked over your elbows.",
      "Lock out softly at the top, then repeat. Exhale on the press."
    ]
  },
  {
    id: "landmine-press",
    name: "Landmine Press",
    equipment: "barbell",
    level: "intermediate",
    primary: "chest",
    secondary: ["front-delt", "triceps"],
    pattern: "landmine-press",
    steps: [
      "Wedge one end of the barbell into a corner or landmine base, holding the other end at shoulder height.",
      "Brace your core and press the bar up and slightly forward.",
      "Lower it back to your shoulder with control.",
      "Keep your ribs down. Don't overarch your lower back."
    ]
  },
  {
    id: "weighted-push-up",
    name: "Weighted Push-Up",
    equipment: "bodyweight",
    level: "advanced",
    primary: "chest",
    secondary: ["triceps"],
    pattern: "pushup",
    steps: [
      "Start in a high plank: hands under shoulders, body in one straight line, glutes squeezed.",
      "Lower your chest toward the floor with elbows at ~45°, keeping your core braced.",
      "Push the floor away to return to the top without sagging at the hips.",
      "Keep your neck neutral and breathe in on the way down, out on the way up."
    ]
  },
  {
    id: "archer-push-up",
    name: "Archer Push-Up",
    equipment: "bodyweight",
    level: "advanced",
    primary: "chest",
    secondary: ["triceps"],
    pattern: "pushup",
    steps: [
      "Start in a high plank: hands under shoulders, body in one straight line, glutes squeezed.",
      "Lower your chest toward the floor with elbows at ~45°, keeping your core braced.",
      "Push the floor away to return to the top without sagging at the hips.",
      "Keep your neck neutral and breathe in on the way down, out on the way up."
    ]
  },
  {
    id: "incline-cable-fly",
    name: "Incline Cable Fly",
    equipment: "cable",
    level: "beginner",
    primary: "chest",
    secondary: [],
    pattern: "cable-fly",
    steps: [
      "Stand centered between the pulleys with handles at shoulder height, one foot forward.",
      "Step forward and bring your hands together in front of your chest in a hugging motion.",
      "Squeeze hard for a second at full contraction.",
      "Control the return until you feel a stretch, then repeat."
    ]
  },
  {
    id: "svend-press",
    name: "Svend Press",
    equipment: "bodyweight",
    level: "beginner",
    primary: "chest",
    secondary: ["front-delt"],
    pattern: "press-h",
    steps: [
      "Set up on the bench with feet planted, shoulder blades pinched, and a slight arch in your back.",
      "Unrack and lower the weight with control to mid-chest, elbows about 45° from your torso.",
      "Press up explosively without bouncing, keeping your wrists stacked over your elbows.",
      "Lock out softly at the top, then repeat. Exhale on the press."
    ]
  },
  {
    id: "decline-push-up",
    name: "Decline Push-Up",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "chest",
    secondary: ["triceps"],
    pattern: "pushup",
    steps: [
      "Start in a high plank: hands under shoulders, body in one straight line, glutes squeezed.",
      "Lower your chest toward the floor with elbows at ~45°, keeping your core braced.",
      "Push the floor away to return to the top without sagging at the hips.",
      "Keep your neck neutral and breathe in on the way down, out on the way up."
    ]
  },
  {
    id: "machine-chest-fly",
    name: "Machine Chest Fly",
    equipment: "machine",
    level: "beginner",
    primary: "chest",
    secondary: [],
    pattern: "fly",
    steps: [
      "Lie back with a dumbbell in each hand, arms extended above your chest with a soft bend in the elbows.",
      "Open your arms wide in an arc until you feel a deep stretch across your chest.",
      "Squeeze your pecs to bring the weights back together over your chest.",
      "Keep the elbow angle fixed. This is a chest isolation move, not a press."
    ]
  },
  {
    id: "deadlift",
    name: "Deadlift",
    equipment: "barbell",
    level: "advanced",
    primary: "back",
    secondary: ["glutes", "hamstrings", "traps"],
    pattern: "deadlift",
    steps: [
      "Stand with the bar over mid-foot, shins close, grip just outside your legs.",
      "Set your back flat, chest up, and push the floor away with your legs.",
      "Stand tall, squeezing your glutes. Don't lean back.",
      "Reverse the motion: hips back, then knees, bar sliding down your legs."
    ]
  },
  {
    id: "bent-over-barbell-row",
    name: "Bent-Over Barbell Row",
    equipment: "barbell",
    level: "intermediate",
    primary: "back",
    secondary: ["biceps", "lats"],
    pattern: "row",
    steps: [
      "Hinge at the hips with a flat back, chest up, holding the weight with arms hanging.",
      "Pull the weight toward your lower ribs, driving your elbows behind you.",
      "Squeeze your shoulder blades together hard at the top.",
      "Lower with control to a full stretch and repeat."
    ]
  },
  {
    id: "t-bar-row",
    name: "T-Bar Row",
    equipment: "barbell",
    level: "intermediate",
    primary: "back",
    secondary: ["biceps"],
    pattern: "row",
    steps: [
      "Hinge at the hips with a flat back, chest up, holding the weight with arms hanging.",
      "Pull the weight toward your lower ribs, driving your elbows behind you.",
      "Squeeze your shoulder blades together hard at the top.",
      "Lower with control to a full stretch and repeat."
    ]
  },
  {
    id: "seated-cable-row",
    name: "Seated Cable Row",
    equipment: "cable",
    level: "beginner",
    primary: "back",
    secondary: ["biceps"],
    pattern: "cable-row",
    steps: [
      "Sit tall with feet braced, chest up, and grab the handle with arms extended.",
      "Pull the handle to your torso, elbows tracking back close to your sides.",
      "Squeeze your back for a second at full contraction.",
      "Extend your arms slowly back to the start without rounding your back."
    ]
  },
  {
    id: "pendlay-row",
    name: "Pendlay Row",
    equipment: "barbell",
    level: "advanced",
    primary: "back",
    secondary: ["lats"],
    pattern: "row",
    steps: [
      "Hinge at the hips with a flat back, chest up, holding the weight with arms hanging.",
      "Pull the weight toward your lower ribs, driving your elbows behind you.",
      "Squeeze your shoulder blades together hard at the top.",
      "Lower with control to a full stretch and repeat."
    ]
  },
  {
    id: "inverted-row",
    name: "Inverted Row",
    equipment: "bodyweight",
    level: "beginner",
    primary: "back",
    secondary: ["biceps"],
    pattern: "inverted-row",
    steps: [
      "Set a bar at waist height and hang underneath it, body straight, heels on the floor.",
      "Pull your chest to the bar, keeping your body rigid like a plank.",
      "Pause briefly at the top, then lower with control.",
      "Make it harder by lowering the bar or elevating your feet."
    ]
  },
  {
    id: "chest-supported-dumbbell-row",
    name: "Chest-Supported Dumbbell Row",
    equipment: "dumbbell",
    level: "beginner",
    primary: "back",
    secondary: ["biceps"],
    pattern: "row",
    steps: [
      "Hinge at the hips with a flat back, chest up, holding the weight with arms hanging.",
      "Pull the weight toward your lower ribs, driving your elbows behind you.",
      "Squeeze your shoulder blades together hard at the top.",
      "Lower with control to a full stretch and repeat."
    ]
  },
  {
    id: "meadows-row",
    name: "Meadows Row",
    equipment: "barbell",
    level: "advanced",
    primary: "back",
    secondary: ["biceps"],
    pattern: "row",
    steps: [
      "Hinge at the hips with a flat back, chest up, holding the weight with arms hanging.",
      "Pull the weight toward your lower ribs, driving your elbows behind you.",
      "Squeeze your shoulder blades together hard at the top.",
      "Lower with control to a full stretch and repeat."
    ]
  },
  {
    id: "rack-pull",
    name: "Rack Pull",
    equipment: "barbell",
    level: "advanced",
    primary: "back",
    secondary: ["traps"],
    pattern: "deadlift",
    steps: [
      "Stand with the bar over mid-foot, shins close, grip just outside your legs.",
      "Set your back flat, chest up, and push the floor away with your legs.",
      "Stand tall, squeezing your glutes. Don't lean back.",
      "Reverse the motion: hips back, then knees, bar sliding down your legs."
    ]
  },
  {
    id: "single-arm-cable-row",
    name: "Single-Arm Cable Row",
    equipment: "cable",
    level: "beginner",
    primary: "back",
    secondary: ["biceps"],
    pattern: "cable-row",
    steps: [
      "Sit tall with feet braced, chest up, and grab the handle with arms extended.",
      "Pull the handle to your torso, elbows tracking back close to your sides.",
      "Squeeze your back for a second at full contraction.",
      "Extend your arms slowly back to the start without rounding your back."
    ]
  },
  {
    id: "yates-row",
    name: "Yates Row",
    equipment: "barbell",
    level: "intermediate",
    primary: "back",
    secondary: ["biceps"],
    pattern: "row",
    steps: [
      "Hinge at the hips with a flat back, chest up, holding the weight with arms hanging.",
      "Pull the weight toward your lower ribs, driving your elbows behind you.",
      "Squeeze your shoulder blades together hard at the top.",
      "Lower with control to a full stretch and repeat."
    ]
  },
  {
    id: "seal-row",
    name: "Seal Row",
    equipment: "barbell",
    level: "intermediate",
    primary: "back",
    secondary: ["biceps"],
    pattern: "row",
    steps: [
      "Hinge at the hips with a flat back, chest up, holding the weight with arms hanging.",
      "Pull the weight toward your lower ribs, driving your elbows behind you.",
      "Squeeze your shoulder blades together hard at the top.",
      "Lower with control to a full stretch and repeat."
    ]
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "lats",
    secondary: ["biceps"],
    pattern: "pullup",
    steps: [
      "Hang from the bar with a full grip, arms straight, shoulders engaged.",
      "Pull your chest toward the bar by driving your elbows down.",
      "Pause at the top with your chin over the bar.",
      "Lower all the way down with control. No kipping unless programmed."
    ]
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    equipment: "cable",
    level: "beginner",
    primary: "lats",
    secondary: ["biceps"],
    pattern: "pulldown",
    steps: [
      "Sit with thighs locked under the pads, gripping the bar wider than shoulders.",
      "Pull the bar down to your upper chest, leaning back just slightly.",
      "Squeeze your lats hard at the bottom.",
      "Let the bar rise with control to a full stretch."
    ]
  },
  {
    id: "wide-grip-pulldown",
    name: "Wide-Grip Pulldown",
    equipment: "cable",
    level: "beginner",
    primary: "lats",
    secondary: ["biceps"],
    pattern: "pulldown",
    steps: [
      "Sit with thighs locked under the pads, gripping the bar wider than shoulders.",
      "Pull the bar down to your upper chest, leaning back just slightly.",
      "Squeeze your lats hard at the bottom.",
      "Let the bar rise with control to a full stretch."
    ]
  },
  {
    id: "straight-arm-pulldown",
    name: "Straight-Arm Pulldown",
    equipment: "cable",
    level: "beginner",
    primary: "lats",
    secondary: [],
    pattern: "straight-pulldown",
    steps: [
      "Stand facing the cable with a straight bar at shoulder height, arms straight.",
      "Keeping your arms straight, pull the bar down to your thighs.",
      "Squeeze your lats at the bottom for a second.",
      "Raise slowly back up, resisting the pull."
    ]
  },
  {
    id: "close-grip-v-bar-pulldown",
    name: "Close-Grip V-Bar Pulldown",
    equipment: "cable",
    level: "beginner",
    primary: "lats",
    secondary: ["biceps"],
    pattern: "pulldown",
    steps: [
      "Sit with thighs locked under the pads, gripping the bar wider than shoulders.",
      "Pull the bar down to your upper chest, leaning back just slightly.",
      "Squeeze your lats hard at the bottom.",
      "Let the bar rise with control to a full stretch."
    ]
  },
  {
    id: "commando-pull-up",
    name: "Commando Pull-Up",
    equipment: "bodyweight",
    level: "advanced",
    primary: "lats",
    secondary: ["biceps"],
    pattern: "pullup",
    steps: [
      "Hang from the bar with a full grip, arms straight, shoulders engaged.",
      "Pull your chest toward the bar by driving your elbows down.",
      "Pause at the top with your chin over the bar.",
      "Lower all the way down with control. No kipping unless programmed."
    ]
  },
  {
    id: "dumbbell-pullover",
    name: "Dumbbell Pullover",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "lats",
    secondary: ["chest"],
    pattern: "pullover",
    steps: [
      "Lie across a bench with only your upper back supported, hips low, holding one dumbbell overhead.",
      "Lower the weight behind your head in an arc until you feel a deep lat stretch.",
      "Pull it back over your chest using your lats, arms nearly straight.",
      "Keep your core braced and don't overarch."
    ]
  },
  {
    id: "chin-up",
    name: "Chin-Up",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "lats",
    secondary: ["biceps"],
    pattern: "pullup",
    steps: [
      "Hang from the bar with a full grip, arms straight, shoulders engaged.",
      "Pull your chest toward the bar by driving your elbows down.",
      "Pause at the top with your chin over the bar.",
      "Lower all the way down with control. No kipping unless programmed."
    ]
  },
  {
    id: "overhead-barbell-press",
    name: "Overhead Barbell Press",
    equipment: "barbell",
    level: "intermediate",
    primary: "shoulders",
    secondary: ["triceps"],
    pattern: "ohp",
    steps: [
      "Stand with the weight at shoulder height, glutes and core braced.",
      "Press overhead until your arms are straight, head moving slightly forward at the top.",
      "Pause briefly, then lower with control back to your shoulders.",
      "Don't lean back excessively. Keep your ribs down."
    ]
  },
  {
    id: "dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    equipment: "dumbbell",
    level: "beginner",
    primary: "shoulders",
    secondary: ["triceps"],
    pattern: "ohp",
    steps: [
      "Stand with the weight at shoulder height, glutes and core braced.",
      "Press overhead until your arms are straight, head moving slightly forward at the top.",
      "Pause briefly, then lower with control back to your shoulders.",
      "Don't lean back excessively. Keep your ribs down."
    ]
  },
  {
    id: "lateral-raise",
    name: "Lateral Raise",
    equipment: "dumbbell",
    level: "beginner",
    primary: "shoulders",
    secondary: [],
    pattern: "raise",
    steps: [
      "Stand tall with a dumbbell in each hand at your sides, slight bend in the elbows.",
      "Raise the weights out to the side (or front) to shoulder height.",
      "Pause briefly, feeling the delts do the work. Don't shrug.",
      "Lower slowly; avoid swinging the weights up with momentum."
    ]
  },
  {
    id: "front-raise",
    name: "Front Raise",
    equipment: "dumbbell",
    level: "beginner",
    primary: "shoulders",
    secondary: [],
    pattern: "raise",
    steps: [
      "Stand tall with a dumbbell in each hand at your sides, slight bend in the elbows.",
      "Raise the weights out to the side (or front) to shoulder height.",
      "Pause briefly, feeling the delts do the work. Don't shrug.",
      "Lower slowly; avoid swinging the weights up with momentum."
    ]
  },
  {
    id: "rear-delt-fly",
    name: "Rear Delt Fly",
    equipment: "dumbbell",
    level: "beginner",
    primary: "shoulders",
    secondary: [],
    pattern: "rear-fly",
    steps: [
      "Hinge forward with a flat back, dumbbells hanging below your chest.",
      "Raise the weights out to the sides with a slight elbow bend, like opening wings.",
      "Squeeze your rear delts at the top.",
      "Lower with control and keep your torso still."
    ]
  },
  {
    id: "arnold-press",
    name: "Arnold Press",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "shoulders",
    secondary: ["triceps"],
    pattern: "ohp",
    steps: [
      "Stand with the weight at shoulder height, glutes and core braced.",
      "Press overhead until your arms are straight, head moving slightly forward at the top.",
      "Pause briefly, then lower with control back to your shoulders.",
      "Don't lean back excessively. Keep your ribs down."
    ]
  },
  {
    id: "push-press",
    name: "Push Press",
    equipment: "barbell",
    level: "advanced",
    primary: "shoulders",
    secondary: ["triceps"],
    pattern: "ohp",
    steps: [
      "Stand with the weight at shoulder height, glutes and core braced.",
      "Press overhead until your arms are straight, head moving slightly forward at the top.",
      "Pause briefly, then lower with control back to your shoulders.",
      "Don't lean back excessively. Keep your ribs down."
    ]
  },
  {
    id: "cable-lateral-raise",
    name: "Cable Lateral Raise",
    equipment: "cable",
    level: "beginner",
    primary: "shoulders",
    secondary: [],
    pattern: "raise",
    steps: [
      "Stand tall with a dumbbell in each hand at your sides, slight bend in the elbows.",
      "Raise the weights out to the side (or front) to shoulder height.",
      "Pause briefly, feeling the delts do the work. Don't shrug.",
      "Lower slowly; avoid swinging the weights up with momentum."
    ]
  },
  {
    id: "face-pull",
    name: "Face Pull",
    equipment: "cable",
    level: "beginner",
    primary: "shoulders",
    secondary: ["traps"],
    pattern: "face-pull",
    steps: [
      "Set the cable at eye level with a rope attachment and step back.",
      "Pull the rope toward your forehead, splitting it so your knuckles face you.",
      "Rotate your shoulders outward at the end. Think 'double biceps' pose.",
      "Extend your arms slowly back to the start."
    ]
  },
  {
    id: "upright-row",
    name: "Upright Row",
    equipment: "barbell",
    level: "intermediate",
    primary: "shoulders",
    secondary: ["traps"],
    pattern: "upright-row",
    steps: [
      "Stand holding the bar with an overhand grip, hands shoulder-width.",
      "Pull the bar straight up along your body to chest height, elbows leading.",
      "Pause briefly, then lower with control.",
      "Stop if you feel shoulder impingement. Dumbbells are friendlier."
    ]
  },
  {
    id: "machine-shoulder-press",
    name: "Machine Shoulder Press",
    equipment: "machine",
    level: "beginner",
    primary: "shoulders",
    secondary: ["triceps"],
    pattern: "machine-press",
    steps: [
      "Adjust the seat so the handles line up with mid-chest, back flat against the pad.",
      "Press the handles forward until your arms are nearly straight.",
      "Squeeze briefly, then lower slowly back to the start.",
      "Don't let the weight stack slam between reps."
    ]
  },
  {
    id: "pike-push-up",
    name: "Pike Push-Up",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "shoulders",
    secondary: ["triceps"],
    pattern: "pushup",
    steps: [
      "Start in a high plank: hands under shoulders, body in one straight line, glutes squeezed.",
      "Lower your chest toward the floor with elbows at ~45°, keeping your core braced.",
      "Push the floor away to return to the top without sagging at the hips.",
      "Keep your neck neutral and breathe in on the way down, out on the way up."
    ]
  },
  {
    id: "bradford-press",
    name: "Bradford Press",
    equipment: "barbell",
    level: "advanced",
    primary: "shoulders",
    secondary: ["triceps"],
    pattern: "ohp",
    steps: [
      "Stand with the weight at shoulder height, glutes and core braced.",
      "Press overhead until your arms are straight, head moving slightly forward at the top.",
      "Pause briefly, then lower with control back to your shoulders.",
      "Don't lean back excessively. Keep your ribs down."
    ]
  },
  {
    id: "cuban-press",
    name: "Cuban Press",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "shoulders",
    secondary: [],
    pattern: "cuban",
    steps: [
      "Hold light dumbbells at your sides and do an upright row to chest height.",
      "Rotate your forearms up so the weights are overhead-ready.",
      "Press the dumbbells overhead, then reverse the whole sequence.",
      "Use very light weight. This is a shoulder-health move."
    ]
  },
  {
    id: "landmine-shoulder-press",
    name: "Landmine Shoulder Press",
    equipment: "barbell",
    level: "intermediate",
    primary: "shoulders",
    secondary: ["triceps"],
    pattern: "landmine-press",
    steps: [
      "Wedge one end of the barbell into a corner or landmine base, holding the other end at shoulder height.",
      "Brace your core and press the bar up and slightly forward.",
      "Lower it back to your shoulder with control.",
      "Keep your ribs down. Don't overarch your lower back."
    ]
  },
  {
    id: "cable-front-raise",
    name: "Cable Front Raise",
    equipment: "cable",
    level: "beginner",
    primary: "shoulders",
    secondary: [],
    pattern: "raise",
    steps: [
      "Stand tall with a dumbbell in each hand at your sides, slight bend in the elbows.",
      "Raise the weights out to the side (or front) to shoulder height.",
      "Pause briefly, feeling the delts do the work. Don't shrug.",
      "Lower slowly; avoid swinging the weights up with momentum."
    ]
  },
  {
    id: "dumbbell-push-press",
    name: "Dumbbell Push Press",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "shoulders",
    secondary: ["triceps"],
    pattern: "ohp",
    steps: [
      "Stand with the weight at shoulder height, glutes and core braced.",
      "Press overhead until your arms are straight, head moving slightly forward at the top.",
      "Pause briefly, then lower with control back to your shoulders.",
      "Don't lean back excessively. Keep your ribs down."
    ]
  },
  {
    id: "barbell-curl",
    name: "Barbell Curl",
    equipment: "barbell",
    level: "beginner",
    primary: "biceps",
    secondary: ["forearms"],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "dumbbell-curl",
    name: "Dumbbell Curl",
    equipment: "dumbbell",
    level: "beginner",
    primary: "biceps",
    secondary: [],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "hammer-curl",
    name: "Hammer Curl",
    equipment: "dumbbell",
    level: "beginner",
    primary: "biceps",
    secondary: ["forearms"],
    pattern: "hammer-curl",
    steps: [
      "Hold dumbbells with a neutral grip (palms facing each other), arms at your sides.",
      "Curl both weights up, keeping your palms facing in the whole time.",
      "Squeeze at the top, then lower with control.",
      "Keep your elbows fixed. Don't let them drift forward."
    ]
  },
  {
    id: "preacher-curl",
    name: "Preacher Curl",
    equipment: "barbell",
    level: "intermediate",
    primary: "biceps",
    secondary: [],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "concentration-curl",
    name: "Concentration Curl",
    equipment: "dumbbell",
    level: "beginner",
    primary: "biceps",
    secondary: [],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "cable-curl",
    name: "Cable Curl",
    equipment: "cable",
    level: "beginner",
    primary: "biceps",
    secondary: [],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "incline-dumbbell-curl",
    name: "Incline Dumbbell Curl",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "biceps",
    secondary: [],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "ez-bar-curl",
    name: "EZ-Bar Curl",
    equipment: "barbell",
    level: "beginner",
    primary: "biceps",
    secondary: [],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "reverse-curl",
    name: "Reverse Curl",
    equipment: "barbell",
    level: "beginner",
    primary: "biceps",
    secondary: ["forearms"],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "spider-curl",
    name: "Spider Curl",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "biceps",
    secondary: [],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "zottman-curl",
    name: "Zottman Curl",
    equipment: "dumbbell",
    level: "advanced",
    primary: "biceps",
    secondary: ["forearms"],
    pattern: "zotten",
    steps: [
      "Curl the dumbbells up with palms facing forward.",
      "At the top, rotate to palms-down (pronated) grip.",
      "Lower slowly with the reverse grip to hammer your forearms.",
      "Rotate back at the bottom and repeat."
    ]
  },
  {
    id: "bayesian-cable-curl",
    name: "Bayesian Cable Curl",
    equipment: "cable",
    level: "intermediate",
    primary: "biceps",
    secondary: [],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "drag-curl",
    name: "Drag Curl",
    equipment: "barbell",
    level: "intermediate",
    primary: "biceps",
    secondary: [],
    pattern: "curl",
    steps: [
      "Stand tall holding the weight with arms extended, elbows pinned at your sides.",
      "Curl the weight up toward your shoulders without swinging.",
      "Squeeze your biceps hard at the top.",
      "Lower slowly to full extension. The negative matters."
    ]
  },
  {
    id: "tricep-rope-pushdown",
    name: "Tricep Rope Pushdown",
    equipment: "cable",
    level: "beginner",
    primary: "triceps",
    secondary: [],
    pattern: "pushdown",
    steps: [
      "Stand facing the cable, elbows pinned tight to your ribs.",
      "Push the handle down until your arms are fully straight.",
      "Squeeze your triceps hard at the bottom.",
      "Let the handle rise slowly. Don't let your elbows move."
    ]
  },
  {
    id: "overhead-cable-extension",
    name: "Overhead Cable Extension",
    equipment: "cable",
    level: "beginner",
    primary: "triceps",
    secondary: [],
    pattern: "overhead-ext",
    steps: [
      "Hold the weight overhead with both hands, elbows pointing forward.",
      "Lower the weight behind your head by bending only at the elbows.",
      "Feel the deep stretch, then extend back up to full lockout.",
      "Keep your upper arms still. Only the forearms move."
    ]
  },
  {
    id: "skull-crusher",
    name: "Skull Crusher",
    equipment: "barbell",
    level: "intermediate",
    primary: "triceps",
    secondary: [],
    pattern: "skullcrusher",
    steps: [
      "Lie on a bench holding the bar above your chest, arms straight.",
      "Bend at the elbows to lower the bar toward your forehead.",
      "Extend back up to full lockout without flaring your elbows.",
      "Keep your upper arms vertical throughout."
    ]
  },
  {
    id: "tricep-dip",
    name: "Tricep Dip",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "triceps",
    secondary: ["chest"],
    pattern: "dip",
    steps: [
      "Grip the bars and lift yourself up, leaning slightly forward for chest or staying upright for triceps.",
      "Lower yourself with control until your shoulders are just below your elbows.",
      "Drive back up without shrugging or swinging your legs.",
      "Keep the movement strict. Add weight only once bodyweight feels easy."
    ]
  },
  {
    id: "close-grip-bench-press",
    name: "Close-Grip Bench Press",
    equipment: "barbell",
    level: "intermediate",
    primary: "triceps",
    secondary: ["chest"],
    pattern: "press-h",
    steps: [
      "Set up on the bench with feet planted, shoulder blades pinched, and a slight arch in your back.",
      "Unrack and lower the weight with control to mid-chest, elbows about 45° from your torso.",
      "Press up explosively without bouncing, keeping your wrists stacked over your elbows.",
      "Lock out softly at the top, then repeat. Exhale on the press."
    ]
  },
  {
    id: "diamond-push-up",
    name: "Diamond Push-Up",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "triceps",
    secondary: [],
    pattern: "pushup",
    steps: [
      "Start in a high plank: hands under shoulders, body in one straight line, glutes squeezed.",
      "Lower your chest toward the floor with elbows at ~45°, keeping your core braced.",
      "Push the floor away to return to the top without sagging at the hips.",
      "Keep your neck neutral and breathe in on the way down, out on the way up."
    ]
  },
  {
    id: "dumbbell-kickback",
    name: "Dumbbell Kickback",
    equipment: "dumbbell",
    level: "beginner",
    primary: "triceps",
    secondary: [],
    pattern: "kickback",
    steps: [
      "Hinge forward, upper arm parallel to the floor, dumbbell in hand.",
      "Extend your forearm back until your arm is straight.",
      "Squeeze the triceps hard at full extension.",
      "Lower slowly. Your upper arm never moves."
    ]
  },
  {
    id: "jm-press",
    name: "JM Press",
    equipment: "barbell",
    level: "advanced",
    primary: "triceps",
    secondary: [],
    pattern: "press-h",
    steps: [
      "Set up on the bench with feet planted, shoulder blades pinched, and a slight arch in your back.",
      "Unrack and lower the weight with control to mid-chest, elbows about 45° from your torso.",
      "Press up explosively without bouncing, keeping your wrists stacked over your elbows.",
      "Lock out softly at the top, then repeat. Exhale on the press."
    ]
  },
  {
    id: "bench-dip",
    name: "Bench Dip",
    equipment: "bodyweight",
    level: "beginner",
    primary: "triceps",
    secondary: [],
    pattern: "dip",
    steps: [
      "Grip the bars and lift yourself up, leaning slightly forward for chest or staying upright for triceps.",
      "Lower yourself with control until your shoulders are just below your elbows.",
      "Drive back up without shrugging or swinging your legs.",
      "Keep the movement strict. Add weight only once bodyweight feels easy."
    ]
  },
  {
    id: "single-arm-cable-pushdown",
    name: "Single-Arm Cable Pushdown",
    equipment: "cable",
    level: "beginner",
    primary: "triceps",
    secondary: [],
    pattern: "pushdown",
    steps: [
      "Stand facing the cable, elbows pinned tight to your ribs.",
      "Push the handle down until your arms are fully straight.",
      "Squeeze your triceps hard at the bottom.",
      "Let the handle rise slowly. Don't let your elbows move."
    ]
  },
  {
    id: "cross-body-cable-extension",
    name: "Cross-Body Cable Extension",
    equipment: "cable",
    level: "intermediate",
    primary: "triceps",
    secondary: [],
    pattern: "overhead-ext",
    steps: [
      "Hold the weight overhead with both hands, elbows pointing forward.",
      "Lower the weight behind your head by bending only at the elbows.",
      "Feel the deep stretch, then extend back up to full lockout.",
      "Keep your upper arms still. Only the forearms move."
    ]
  },
  {
    id: "weighted-dip",
    name: "Weighted Dip",
    equipment: "bodyweight",
    level: "advanced",
    primary: "triceps",
    secondary: ["chest"],
    pattern: "dip",
    steps: [
      "Grip the bars and lift yourself up, leaning slightly forward for chest or staying upright for triceps.",
      "Lower yourself with control until your shoulders are just below your elbows.",
      "Drive back up without shrugging or swinging your legs.",
      "Keep the movement strict. Add weight only once bodyweight feels easy."
    ]
  },
  {
    id: "barbell-wrist-curl",
    name: "Barbell Wrist Curl",
    equipment: "barbell",
    level: "beginner",
    primary: "forearms",
    secondary: [],
    pattern: "wrist-curl",
    steps: [
      "Rest your forearms on a bench, wrists hanging off the edge, holding the bar.",
      "Curl the weight up using only your wrists.",
      "Squeeze at the top for a second.",
      "Lower to a full stretch and repeat."
    ]
  },
  {
    id: "reverse-wrist-curl",
    name: "Reverse Wrist Curl",
    equipment: "barbell",
    level: "beginner",
    primary: "forearms",
    secondary: [],
    pattern: "wrist-curl",
    steps: [
      "Rest your forearms on a bench, wrists hanging off the edge, holding the bar.",
      "Curl the weight up using only your wrists.",
      "Squeeze at the top for a second.",
      "Lower to a full stretch and repeat."
    ]
  },
  {
    id: "farmer-s-carry",
    name: "Farmer's Carry",
    equipment: "dumbbell",
    level: "beginner",
    primary: "forearms",
    secondary: ["traps"],
    pattern: "carry",
    steps: [
      "Pick up heavy weights and stand tall. Shoulders back, core braced.",
      "Walk with short, controlled steps, keeping your torso perfectly still.",
      "Breathe steadily as you go for distance or time.",
      "Set the weights down with a flat back, not a rounded one."
    ]
  },
  {
    id: "plate-pinch-hold",
    name: "Plate Pinch Hold",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "forearms",
    secondary: [],
    pattern: "hang",
    steps: [
      "Grab the bar (or towels) with a full grip and hang with arms straight.",
      "Engage your shoulders slightly. Don't just dangle passively.",
      "Hold for time, breathing steadily.",
      "Drop down safely when your grip gives out."
    ]
  },
  {
    id: "dead-hang",
    name: "Dead Hang",
    equipment: "bodyweight",
    level: "beginner",
    primary: "forearms",
    secondary: ["lats"],
    pattern: "hang",
    steps: [
      "Grab the bar (or towels) with a full grip and hang with arms straight.",
      "Engage your shoulders slightly. Don't just dangle passively.",
      "Hold for time, breathing steadily.",
      "Drop down safely when your grip gives out."
    ]
  },
  {
    id: "towel-hang",
    name: "Towel Hang",
    equipment: "bodyweight",
    level: "advanced",
    primary: "forearms",
    secondary: [],
    pattern: "hang",
    steps: [
      "Grab the bar (or towels) with a full grip and hang with arms straight.",
      "Engage your shoulders slightly. Don't just dangle passively.",
      "Hold for time, breathing steadily.",
      "Drop down safely when your grip gives out."
    ]
  },
  {
    id: "wrist-roller",
    name: "Wrist Roller",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "forearms",
    secondary: [],
    pattern: "wrist-curl",
    steps: [
      "Rest your forearms on a bench, wrists hanging off the edge, holding the bar.",
      "Curl the weight up using only your wrists.",
      "Squeeze at the top for a second.",
      "Lower to a full stretch and repeat."
    ]
  },
  {
    id: "crunch",
    name: "Crunch",
    equipment: "bodyweight",
    level: "beginner",
    primary: "abs",
    secondary: [],
    pattern: "crunch",
    steps: [
      "Lie on your back, knees bent, hands lightly behind your head.",
      "Curl your shoulders off the floor, driving your ribs toward your hips.",
      "Squeeze at the top for a second.",
      "Lower with control. Don't yank your neck."
    ]
  },
  {
    id: "plank",
    name: "Plank",
    equipment: "bodyweight",
    level: "beginner",
    primary: "abs",
    secondary: [],
    pattern: "plank",
    steps: [
      "Get into a forearm plank: elbows under shoulders, body in one line.",
      "Squeeze your glutes and brace your abs like you're about to be punched.",
      "Breathe steadily. Don't hold your breath.",
      "Stop when your hips start to sag."
    ]
  },
  {
    id: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "abs",
    secondary: [],
    pattern: "leg-raise",
    steps: [
      "Hang from a bar (or lie on the floor) with legs straight.",
      "Raise your legs until they're parallel to the floor (or higher).",
      "Lower them slowly without swinging.",
      "Keep the movement strict. Momentum cheats your abs."
    ]
  },
  {
    id: "cable-crunch",
    name: "Cable Crunch",
    equipment: "cable",
    level: "intermediate",
    primary: "abs",
    secondary: [],
    pattern: "crunch",
    steps: [
      "Lie on your back, knees bent, hands lightly behind your head.",
      "Curl your shoulders off the floor, driving your ribs toward your hips.",
      "Squeeze at the top for a second.",
      "Lower with control. Don't yank your neck."
    ]
  },
  {
    id: "ab-wheel-rollout",
    name: "Ab Wheel Rollout",
    equipment: "bodyweight",
    level: "advanced",
    primary: "abs",
    secondary: ["lats"],
    pattern: "rollout",
    steps: [
      "Kneel with the ab wheel under your shoulders.",
      "Roll forward slowly, keeping your core braced and back flat.",
      "Go as far as you can without your hips sagging.",
      "Pull back to the start using your abs."
    ]
  },
  {
    id: "bicycle-crunch",
    name: "Bicycle Crunch",
    equipment: "bodyweight",
    level: "beginner",
    primary: "abs",
    secondary: ["obliques"],
    pattern: "crunch",
    steps: [
      "Lie on your back, knees bent, hands lightly behind your head.",
      "Curl your shoulders off the floor, driving your ribs toward your hips.",
      "Squeeze at the top for a second.",
      "Lower with control. Don't yank your neck."
    ]
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    equipment: "bodyweight",
    level: "beginner",
    primary: "abs",
    secondary: [],
    pattern: "deadbug",
    steps: [
      "Lie on your back, arms reaching up, knees bent at 90°.",
      "Press your lower back into the floor and extend opposite arm and leg.",
      "Return with control, then switch sides.",
      "Never let your back arch off the floor."
    ]
  },
  {
    id: "hollow-body-hold",
    name: "Hollow Body Hold",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "abs",
    secondary: [],
    pattern: "plank",
    steps: [
      "Get into a forearm plank: elbows under shoulders, body in one line.",
      "Squeeze your glutes and brace your abs like you're about to be punched.",
      "Breathe steadily. Don't hold your breath.",
      "Stop when your hips start to sag."
    ]
  },
  {
    id: "lying-leg-raise",
    name: "Lying Leg Raise",
    equipment: "bodyweight",
    level: "beginner",
    primary: "abs",
    secondary: [],
    pattern: "leg-raise",
    steps: [
      "Hang from a bar (or lie on the floor) with legs straight.",
      "Raise your legs until they're parallel to the floor (or higher).",
      "Lower them slowly without swinging.",
      "Keep the movement strict. Momentum cheats your abs."
    ]
  },
  {
    id: "toe-to-bar",
    name: "Toe-to-Bar",
    equipment: "bodyweight",
    level: "advanced",
    primary: "abs",
    secondary: ["lats"],
    pattern: "leg-raise",
    steps: [
      "Hang from a bar (or lie on the floor) with legs straight.",
      "Raise your legs until they're parallel to the floor (or higher).",
      "Lower them slowly without swinging.",
      "Keep the movement strict. Momentum cheats your abs."
    ]
  },
  {
    id: "sit-up",
    name: "Sit-Up",
    equipment: "bodyweight",
    level: "beginner",
    primary: "abs",
    secondary: [],
    pattern: "crunch",
    steps: [
      "Lie on your back, knees bent, hands lightly behind your head.",
      "Curl your shoulders off the floor, driving your ribs toward your hips.",
      "Squeeze at the top for a second.",
      "Lower with control. Don't yank your neck."
    ]
  },
  {
    id: "pallof-press",
    name: "Pallof Press",
    equipment: "cable",
    level: "intermediate",
    primary: "abs",
    secondary: ["obliques"],
    pattern: "pallof",
    steps: [
      "Stand sideways to a cable set at chest height, holding the handle at your sternum.",
      "Press the handle straight out. Resist the cable trying to rotate you.",
      "Hold for a breath, feeling your obliques fire.",
      "Bring it back in with control and repeat."
    ]
  },
  {
    id: "hanging-knee-raise",
    name: "Hanging Knee Raise",
    equipment: "bodyweight",
    level: "beginner",
    primary: "abs",
    secondary: [],
    pattern: "leg-raise",
    steps: [
      "Hang from a bar (or lie on the floor) with legs straight.",
      "Raise your legs until they're parallel to the floor (or higher).",
      "Lower them slowly without swinging.",
      "Keep the movement strict. Momentum cheats your abs."
    ]
  },
  {
    id: "standing-cable-crunch",
    name: "Standing Cable Crunch",
    equipment: "cable",
    level: "intermediate",
    primary: "abs",
    secondary: [],
    pattern: "crunch",
    steps: [
      "Lie on your back, knees bent, hands lightly behind your head.",
      "Curl your shoulders off the floor, driving your ribs toward your hips.",
      "Squeeze at the top for a second.",
      "Lower with control. Don't yank your neck."
    ]
  },
  {
    id: "russian-twist",
    name: "Russian Twist",
    equipment: "bodyweight",
    level: "beginner",
    primary: "obliques",
    secondary: ["abs"],
    pattern: "twist",
    steps: [
      "Sit leaning back slightly, feet off the floor, holding a weight.",
      "Rotate your torso to one side, bringing the weight beside your hip.",
      "Rotate to the other side with control.",
      "Keep your chest up and move from the core, not the arms."
    ]
  },
  {
    id: "side-plank",
    name: "Side Plank",
    equipment: "bodyweight",
    level: "beginner",
    primary: "obliques",
    secondary: [],
    pattern: "side-plank",
    steps: [
      "Lie on your side, propped on one forearm, feet stacked.",
      "Lift your hips so your body forms a straight line.",
      "Hold while breathing steadily, obliques engaged.",
      "Lower with control, then switch sides."
    ]
  },
  {
    id: "cable-woodchopper",
    name: "Cable Woodchopper",
    equipment: "cable",
    level: "intermediate",
    primary: "obliques",
    secondary: ["abs"],
    pattern: "woodchopper",
    steps: [
      "Stand sideways to the cable set high, holding the handle with both hands.",
      "Pull the handle down across your body to the opposite hip, rotating your torso.",
      "Control the return to the start.",
      "Keep your arms fairly straight. Power comes from the core."
    ]
  },
  {
    id: "oblique-crunch",
    name: "Oblique Crunch",
    equipment: "bodyweight",
    level: "beginner",
    primary: "obliques",
    secondary: [],
    pattern: "crunch",
    steps: [
      "Lie on your back, knees bent, hands lightly behind your head.",
      "Curl your shoulders off the floor, driving your ribs toward your hips.",
      "Squeeze at the top for a second.",
      "Lower with control. Don't yank your neck."
    ]
  },
  {
    id: "windshield-wipers",
    name: "Windshield Wipers",
    equipment: "bodyweight",
    level: "advanced",
    primary: "obliques",
    secondary: ["abs"],
    pattern: "leg-raise",
    steps: [
      "Hang from a bar (or lie on the floor) with legs straight.",
      "Raise your legs until they're parallel to the floor (or higher).",
      "Lower them slowly without swinging.",
      "Keep the movement strict. Momentum cheats your abs."
    ]
  },
  {
    id: "suitcase-carry",
    name: "Suitcase Carry",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "obliques",
    secondary: ["forearms"],
    pattern: "carry",
    steps: [
      "Pick up heavy weights and stand tall. Shoulders back, core braced.",
      "Walk with short, controlled steps, keeping your torso perfectly still.",
      "Breathe steadily as you go for distance or time.",
      "Set the weights down with a flat back, not a rounded one."
    ]
  },
  {
    id: "landmine-rotation",
    name: "Landmine Rotation",
    equipment: "barbell",
    level: "intermediate",
    primary: "obliques",
    secondary: [],
    pattern: "woodchopper",
    steps: [
      "Stand sideways to the cable set high, holding the handle with both hands.",
      "Pull the handle down across your body to the opposite hip, rotating your torso.",
      "Control the return to the start.",
      "Keep your arms fairly straight. Power comes from the core."
    ]
  },
  {
    id: "copenhagen-plank",
    name: "Copenhagen Plank",
    equipment: "bodyweight",
    level: "advanced",
    primary: "obliques",
    secondary: ["quads"],
    pattern: "side-plank",
    steps: [
      "Lie on your side, propped on one forearm, feet stacked.",
      "Lift your hips so your body forms a straight line.",
      "Hold while breathing steadily, obliques engaged.",
      "Lower with control, then switch sides."
    ]
  },
  {
    id: "barbell-hip-thrust",
    name: "Barbell Hip Thrust",
    equipment: "barbell",
    level: "intermediate",
    primary: "glutes",
    secondary: ["hamstrings"],
    pattern: "hip-thrust",
    steps: [
      "Sit with your upper back against a bench, feet flat, weight across your hips.",
      "Drive through your heels to lift your hips until your body forms a straight line.",
      "Squeeze your glutes hard for two seconds at the top.",
      "Lower with control and repeat."
    ]
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    equipment: "bodyweight",
    level: "beginner",
    primary: "glutes",
    secondary: [],
    pattern: "hip-thrust",
    steps: [
      "Sit with your upper back against a bench, feet flat, weight across your hips.",
      "Drive through your heels to lift your hips until your body forms a straight line.",
      "Squeeze your glutes hard for two seconds at the top.",
      "Lower with control and repeat."
    ]
  },
  {
    id: "kettlebell-swing",
    name: "Kettlebell Swing",
    equipment: "kettlebell",
    level: "intermediate",
    primary: "glutes",
    secondary: ["hamstrings", "lower-back"],
    pattern: "swing",
    steps: [
      "Stand with feet wide, kettlebell on the floor in front of you.",
      "Hike the bell back between your legs, then snap your hips forward.",
      "Let the bell float to chest height. Your arms are just ropes.",
      "Guide it back down and repeat in one fluid rhythm."
    ]
  },
  {
    id: "cable-kickback",
    name: "Cable Kickback",
    equipment: "cable",
    level: "beginner",
    primary: "glutes",
    secondary: [],
    pattern: "kickback",
    steps: [
      "Hinge forward, upper arm parallel to the floor, dumbbell in hand.",
      "Extend your forearm back until your arm is straight.",
      "Squeeze the triceps hard at full extension.",
      "Lower slowly. Your upper arm never moves."
    ]
  },
  {
    id: "dumbbell-step-up",
    name: "Dumbbell Step-Up",
    equipment: "dumbbell",
    level: "beginner",
    primary: "glutes",
    secondary: ["quads"],
    pattern: "carry",
    steps: [
      "Pick up heavy weights and stand tall. Shoulders back, core braced.",
      "Walk with short, controlled steps, keeping your torso perfectly still.",
      "Breathe steadily as you go for distance or time.",
      "Set the weights down with a flat back, not a rounded one."
    ]
  },
  {
    id: "curtsy-lunge",
    name: "Curtsy Lunge",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "glutes",
    secondary: ["quads"],
    pattern: "lunge",
    steps: [
      "Stand tall, then step forward (or back) into a long stride.",
      "Lower until both knees are near 90°, torso upright.",
      "Drive through your front heel to return to standing.",
      "Alternate legs, keeping your balance centered."
    ]
  },
  {
    id: "fire-hydrant",
    name: "Fire Hydrant",
    equipment: "bodyweight",
    level: "beginner",
    primary: "glutes",
    secondary: [],
    pattern: "hang",
    steps: [
      "Grab the bar (or towels) with a full grip and hang with arms straight.",
      "Engage your shoulders slightly. Don't just dangle passively.",
      "Hold for time, breathing steadily.",
      "Drop down safely when your grip gives out."
    ]
  },
  {
    id: "donkey-kick",
    name: "Donkey Kick",
    equipment: "bodyweight",
    level: "beginner",
    primary: "glutes",
    secondary: [],
    pattern: "hang",
    steps: [
      "Grab the bar (or towels) with a full grip and hang with arms straight.",
      "Engage your shoulders slightly. Don't just dangle passively.",
      "Hold for time, breathing steadily.",
      "Drop down safely when your grip gives out."
    ]
  },
  {
    id: "frog-pump",
    name: "Frog Pump",
    equipment: "bodyweight",
    level: "beginner",
    primary: "glutes",
    secondary: [],
    pattern: "hip-thrust",
    steps: [
      "Sit with your upper back against a bench, feet flat, weight across your hips.",
      "Drive through your heels to lift your hips until your body forms a straight line.",
      "Squeeze your glutes hard for two seconds at the top.",
      "Lower with control and repeat."
    ]
  },
  {
    id: "sumo-deadlift",
    name: "Sumo Deadlift",
    equipment: "barbell",
    level: "advanced",
    primary: "glutes",
    secondary: ["quads", "traps"],
    pattern: "deadlift",
    steps: [
      "Stand with the bar over mid-foot, shins close, grip just outside your legs.",
      "Set your back flat, chest up, and push the floor away with your legs.",
      "Stand tall, squeezing your glutes. Don't lean back.",
      "Reverse the motion: hips back, then knees, bar sliding down your legs."
    ]
  },
  {
    id: "lateral-band-walk",
    name: "Lateral Band Walk",
    equipment: "band",
    level: "beginner",
    primary: "glutes",
    secondary: [],
    pattern: "carry",
    steps: [
      "Pick up heavy weights and stand tall. Shoulders back, core braced.",
      "Walk with short, controlled steps, keeping your torso perfectly still.",
      "Breathe steadily as you go for distance or time.",
      "Set the weights down with a flat back, not a rounded one."
    ]
  },
  {
    id: "single-leg-hip-thrust",
    name: "Single-Leg Hip Thrust",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "glutes",
    secondary: [],
    pattern: "hip-thrust",
    steps: [
      "Sit with your upper back against a bench, feet flat, weight across your hips.",
      "Drive through your heels to lift your hips until your body forms a straight line.",
      "Squeeze your glutes hard for two seconds at the top.",
      "Lower with control and repeat."
    ]
  },
  {
    id: "back-squat",
    name: "Back Squat",
    equipment: "barbell",
    level: "intermediate",
    primary: "quads",
    secondary: ["glutes"],
    pattern: "squat",
    steps: [
      "Set the bar across your upper back (or hold the weight at your chest), feet shoulder-width.",
      "Break at the hips and knees together, sitting down between your heels.",
      "Descend until your hip crease is below your knees, chest up.",
      "Drive through your whole foot to stand back up."
    ]
  },
  {
    id: "front-squat",
    name: "Front Squat",
    equipment: "barbell",
    level: "advanced",
    primary: "quads",
    secondary: ["glutes"],
    pattern: "squat",
    steps: [
      "Set the bar across your upper back (or hold the weight at your chest), feet shoulder-width.",
      "Break at the hips and knees together, sitting down between your heels.",
      "Descend until your hip crease is below your knees, chest up.",
      "Drive through your whole foot to stand back up."
    ]
  },
  {
    id: "leg-press",
    name: "Leg Press",
    equipment: "machine",
    level: "beginner",
    primary: "quads",
    secondary: ["glutes"],
    pattern: "leg-press",
    steps: [
      "Sit with your back flat and feet shoulder-width on the platform.",
      "Release the safeties and lower the platform until your knees reach ~90°.",
      "Press through your whole foot without locking your knees hard.",
      "Keep your lower back glued to the seat."
    ]
  },
  {
    id: "walking-lunge",
    name: "Walking Lunge",
    equipment: "dumbbell",
    level: "beginner",
    primary: "quads",
    secondary: ["glutes"],
    pattern: "lunge",
    steps: [
      "Stand tall, then step forward (or back) into a long stride.",
      "Lower until both knees are near 90°, torso upright.",
      "Drive through your front heel to return to standing.",
      "Alternate legs, keeping your balance centered."
    ]
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "quads",
    secondary: ["glutes"],
    pattern: "lunge",
    steps: [
      "Stand tall, then step forward (or back) into a long stride.",
      "Lower until both knees are near 90°, torso upright.",
      "Drive through your front heel to return to standing.",
      "Alternate legs, keeping your balance centered."
    ]
  },
  {
    id: "goblet-squat",
    name: "Goblet Squat",
    equipment: "dumbbell",
    level: "beginner",
    primary: "quads",
    secondary: ["glutes"],
    pattern: "squat",
    steps: [
      "Set the bar across your upper back (or hold the weight at your chest), feet shoulder-width.",
      "Break at the hips and knees together, sitting down between your heels.",
      "Descend until your hip crease is below your knees, chest up.",
      "Drive through your whole foot to stand back up."
    ]
  },
  {
    id: "hack-squat",
    name: "Hack Squat",
    equipment: "machine",
    level: "intermediate",
    primary: "quads",
    secondary: [],
    pattern: "squat",
    steps: [
      "Set the bar across your upper back (or hold the weight at your chest), feet shoulder-width.",
      "Break at the hips and knees together, sitting down between your heels.",
      "Descend until your hip crease is below your knees, chest up.",
      "Drive through your whole foot to stand back up."
    ]
  },
  {
    id: "leg-extension",
    name: "Leg Extension",
    equipment: "machine",
    level: "beginner",
    primary: "quads",
    secondary: [],
    pattern: "leg-extension",
    steps: [
      "Sit with the pad resting on your lower shins, back against the seat.",
      "Extend your knees to lift the weight until your legs are straight.",
      "Squeeze your quads hard at the top for a second.",
      "Lower slowly back to the start."
    ]
  },
  {
    id: "sissy-squat",
    name: "Sissy Squat",
    equipment: "bodyweight",
    level: "advanced",
    primary: "quads",
    secondary: [],
    pattern: "squat",
    steps: [
      "Set the bar across your upper back (or hold the weight at your chest), feet shoulder-width.",
      "Break at the hips and knees together, sitting down between your heels.",
      "Descend until your hip crease is below your knees, chest up.",
      "Drive through your whole foot to stand back up."
    ]
  },
  {
    id: "box-squat",
    name: "Box Squat",
    equipment: "barbell",
    level: "intermediate",
    primary: "quads",
    secondary: ["glutes"],
    pattern: "squat",
    steps: [
      "Set the bar across your upper back (or hold the weight at your chest), feet shoulder-width.",
      "Break at the hips and knees together, sitting down between your heels.",
      "Descend until your hip crease is below your knees, chest up.",
      "Drive through your whole foot to stand back up."
    ]
  },
  {
    id: "pistol-squat",
    name: "Pistol Squat",
    equipment: "bodyweight",
    level: "advanced",
    primary: "quads",
    secondary: ["glutes"],
    pattern: "lunge",
    steps: [
      "Stand tall, then step forward (or back) into a long stride.",
      "Lower until both knees are near 90°, torso upright.",
      "Drive through your front heel to return to standing.",
      "Alternate legs, keeping your balance centered."
    ]
  },
  {
    id: "wall-sit",
    name: "Wall Sit",
    equipment: "bodyweight",
    level: "beginner",
    primary: "quads",
    secondary: [],
    pattern: "wall-sit",
    steps: [
      "Lean your back against a wall and slide down until your thighs are parallel to the floor.",
      "Keep your knees over your ankles and your core braced.",
      "Hold the position, breathing steadily.",
      "Push through the burn. Stop if your form breaks."
    ]
  },
  {
    id: "spanish-squat",
    name: "Spanish Squat",
    equipment: "band",
    level: "intermediate",
    primary: "quads",
    secondary: [],
    pattern: "wall-sit",
    steps: [
      "Lean your back against a wall and slide down until your thighs are parallel to the floor.",
      "Keep your knees over your ankles and your core braced.",
      "Hold the position, breathing steadily.",
      "Push through the burn. Stop if your form breaks."
    ]
  },
  {
    id: "reverse-lunge",
    name: "Reverse Lunge",
    equipment: "dumbbell",
    level: "beginner",
    primary: "quads",
    secondary: ["glutes"],
    pattern: "lunge",
    steps: [
      "Stand tall, then step forward (or back) into a long stride.",
      "Lower until both knees are near 90°, torso upright.",
      "Drive through your front heel to return to standing.",
      "Alternate legs, keeping your balance centered."
    ]
  },
  {
    id: "cyclist-squat",
    name: "Cyclist Squat",
    equipment: "barbell",
    level: "intermediate",
    primary: "quads",
    secondary: [],
    pattern: "squat",
    steps: [
      "Set the bar across your upper back (or hold the weight at your chest), feet shoulder-width.",
      "Break at the hips and knees together, sitting down between your heels.",
      "Descend until your hip crease is below your knees, chest up.",
      "Drive through your whole foot to stand back up."
    ]
  },
  {
    id: "belt-squat",
    name: "Belt Squat",
    equipment: "machine",
    level: "intermediate",
    primary: "quads",
    secondary: ["glutes"],
    pattern: "squat",
    steps: [
      "Set the bar across your upper back (or hold the weight at your chest), feet shoulder-width.",
      "Break at the hips and knees together, sitting down between your heels.",
      "Descend until your hip crease is below your knees, chest up.",
      "Drive through your whole foot to stand back up."
    ]
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    equipment: "barbell",
    level: "intermediate",
    primary: "hamstrings",
    secondary: ["glutes", "lower-back"],
    pattern: "rdl",
    steps: [
      "Stand holding the weight, feet hip-width, soft knees.",
      "Push your hips straight back, letting the weight slide down your thighs.",
      "Go until you feel a deep hamstring stretch, back flat.",
      "Drive your hips forward to stand, squeezing your glutes."
    ]
  },
  {
    id: "nordic-ham-curl",
    name: "Nordic Ham Curl",
    equipment: "bodyweight",
    level: "advanced",
    primary: "hamstrings",
    secondary: [],
    pattern: "nordic",
    steps: [
      "Kneel with your feet anchored, body tall, arms crossed or at your sides.",
      "Lower yourself forward as slowly as possible, resisting with your hamstrings.",
      "Catch yourself with your hands and push back up to start.",
      "This is brutally hard. Start with a limited range."
    ]
  },
  {
    id: "lying-leg-curl",
    name: "Lying Leg Curl",
    equipment: "machine",
    level: "beginner",
    primary: "hamstrings",
    secondary: [],
    pattern: "leg-curl",
    steps: [
      "Lie face down with the pad above your heels (or sit per the machine).",
      "Curl your heels toward your glutes, squeezing your hamstrings.",
      "Pause briefly at full contraction.",
      "Lower slowly to full extension."
    ]
  },
  {
    id: "seated-leg-curl",
    name: "Seated Leg Curl",
    equipment: "machine",
    level: "beginner",
    primary: "hamstrings",
    secondary: [],
    pattern: "leg-curl",
    steps: [
      "Lie face down with the pad above your heels (or sit per the machine).",
      "Curl your heels toward your glutes, squeezing your hamstrings.",
      "Pause briefly at full contraction.",
      "Lower slowly to full extension."
    ]
  },
  {
    id: "good-morning",
    name: "Good Morning",
    equipment: "barbell",
    level: "intermediate",
    primary: "hamstrings",
    secondary: ["lower-back"],
    pattern: "good-morning",
    steps: [
      "Stand with the bar across your upper back, feet hip-width.",
      "Push your hips back, hinging forward with a flat back.",
      "Go until your torso is near parallel or you feel a deep stretch.",
      "Drive your hips forward to stand back up."
    ]
  },
  {
    id: "stiff-leg-deadlift",
    name: "Stiff-Leg Deadlift",
    equipment: "barbell",
    level: "intermediate",
    primary: "hamstrings",
    secondary: ["lower-back"],
    pattern: "rdl",
    steps: [
      "Stand holding the weight, feet hip-width, soft knees.",
      "Push your hips straight back, letting the weight slide down your thighs.",
      "Go until you feel a deep hamstring stretch, back flat.",
      "Drive your hips forward to stand, squeezing your glutes."
    ]
  },
  {
    id: "glute-ham-raise",
    name: "Glute-Ham Raise",
    equipment: "bodyweight",
    level: "advanced",
    primary: "hamstrings",
    secondary: ["glutes"],
    pattern: "nordic",
    steps: [
      "Kneel with your feet anchored, body tall, arms crossed or at your sides.",
      "Lower yourself forward as slowly as possible, resisting with your hamstrings.",
      "Catch yourself with your hands and push back up to start.",
      "This is brutally hard. Start with a limited range."
    ]
  },
  {
    id: "single-leg-romanian-deadlift",
    name: "Single-Leg Romanian Deadlift",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "hamstrings",
    secondary: ["glutes"],
    pattern: "rdl",
    steps: [
      "Stand holding the weight, feet hip-width, soft knees.",
      "Push your hips straight back, letting the weight slide down your thighs.",
      "Go until you feel a deep hamstring stretch, back flat.",
      "Drive your hips forward to stand, squeezing your glutes."
    ]
  },
  {
    id: "cable-pull-through",
    name: "Cable Pull-Through",
    equipment: "cable",
    level: "beginner",
    primary: "hamstrings",
    secondary: ["glutes"],
    pattern: "pull-through",
    steps: [
      "Face away from a low cable, rope between your legs.",
      "Hinge back, letting the rope pull your hips behind you.",
      "Drive your hips forward explosively, squeezing your glutes.",
      "Keep your back flat and arms straight throughout."
    ]
  },
  {
    id: "swiss-ball-leg-curl",
    name: "Swiss Ball Leg Curl",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "hamstrings",
    secondary: ["glutes"],
    pattern: "leg-curl",
    steps: [
      "Lie face down with the pad above your heels (or sit per the machine).",
      "Curl your heels toward your glutes, squeezing your hamstrings.",
      "Pause briefly at full contraction.",
      "Lower slowly to full extension."
    ]
  },
  {
    id: "slider-leg-curl",
    name: "Slider Leg Curl",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "hamstrings",
    secondary: [],
    pattern: "leg-curl",
    steps: [
      "Lie face down with the pad above your heels (or sit per the machine).",
      "Curl your heels toward your glutes, squeezing your hamstrings.",
      "Pause briefly at full contraction.",
      "Lower slowly to full extension."
    ]
  },
  {
    id: "standing-calf-raise",
    name: "Standing Calf Raise",
    equipment: "machine",
    level: "beginner",
    primary: "calves",
    secondary: [],
    pattern: "calf-raise",
    steps: [
      "Stand with the balls of your feet on the edge of a step or platform.",
      "Rise as high as possible onto your toes, squeezing your calves.",
      "Pause for a second at the very top.",
      "Lower all the way down for a deep stretch."
    ]
  },
  {
    id: "seated-calf-raise",
    name: "Seated Calf Raise",
    equipment: "machine",
    level: "beginner",
    primary: "calves",
    secondary: [],
    pattern: "calf-raise",
    steps: [
      "Stand with the balls of your feet on the edge of a step or platform.",
      "Rise as high as possible onto your toes, squeezing your calves.",
      "Pause for a second at the very top.",
      "Lower all the way down for a deep stretch."
    ]
  },
  {
    id: "single-leg-calf-raise",
    name: "Single-Leg Calf Raise",
    equipment: "bodyweight",
    level: "beginner",
    primary: "calves",
    secondary: [],
    pattern: "calf-raise",
    steps: [
      "Stand with the balls of your feet on the edge of a step or platform.",
      "Rise as high as possible onto your toes, squeezing your calves.",
      "Pause for a second at the very top.",
      "Lower all the way down for a deep stretch."
    ]
  },
  {
    id: "donkey-calf-raise",
    name: "Donkey Calf Raise",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "calves",
    secondary: [],
    pattern: "calf-raise",
    steps: [
      "Stand with the balls of your feet on the edge of a step or platform.",
      "Rise as high as possible onto your toes, squeezing your calves.",
      "Pause for a second at the very top.",
      "Lower all the way down for a deep stretch."
    ]
  },
  {
    id: "leg-press-calf-raise",
    name: "Leg Press Calf Raise",
    equipment: "machine",
    level: "beginner",
    primary: "calves",
    secondary: [],
    pattern: "calf-raise",
    steps: [
      "Stand with the balls of your feet on the edge of a step or platform.",
      "Rise as high as possible onto your toes, squeezing your calves.",
      "Pause for a second at the very top.",
      "Lower all the way down for a deep stretch."
    ]
  },
  {
    id: "jump-rope",
    name: "Jump Rope",
    equipment: "bodyweight",
    level: "beginner",
    primary: "calves",
    secondary: [],
    pattern: "cardio",
    steps: [
      "Warm up easy for 3–5 minutes before raising the intensity.",
      "Build to a challenging but sustainable pace. You should be breathing hard but in control.",
      "Hold your target effort for the programmed time or distance.",
      "Cool down easy for 3–5 minutes afterward."
    ]
  },
  {
    id: "box-jump",
    name: "Box Jump",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "calves",
    secondary: ["quads"],
    pattern: "box-jump",
    steps: [
      "Stand facing a sturdy box, feet shoulder-width.",
      "Swing your arms and jump, landing soft with knees bent on top of the box.",
      "Stand tall, then step (don't jump) back down.",
      "Pick a box height you can land on quietly every time."
    ]
  },
  {
    id: "tibialis-raise",
    name: "Tibialis Raise",
    equipment: "bodyweight",
    level: "beginner",
    primary: "calves",
    secondary: [],
    pattern: "calf-raise",
    steps: [
      "Stand with the balls of your feet on the edge of a step or platform.",
      "Rise as high as possible onto your toes, squeezing your calves.",
      "Pause for a second at the very top.",
      "Lower all the way down for a deep stretch."
    ]
  },
  {
    id: "barbell-shrug",
    name: "Barbell Shrug",
    equipment: "barbell",
    level: "beginner",
    primary: "traps",
    secondary: [],
    pattern: "shrug",
    steps: [
      "Stand tall holding the weight at your sides with a straight back.",
      "Shrug your shoulders straight up toward your ears as high as possible.",
      "Hold the squeeze for a full second at the top.",
      "Lower with control. No rolling the shoulders."
    ]
  },
  {
    id: "dumbbell-shrug",
    name: "Dumbbell Shrug",
    equipment: "dumbbell",
    level: "beginner",
    primary: "traps",
    secondary: [],
    pattern: "shrug",
    steps: [
      "Stand tall holding the weight at your sides with a straight back.",
      "Shrug your shoulders straight up toward your ears as high as possible.",
      "Hold the squeeze for a full second at the top.",
      "Lower with control. No rolling the shoulders."
    ]
  },
  {
    id: "cable-shrug",
    name: "Cable Shrug",
    equipment: "cable",
    level: "beginner",
    primary: "traps",
    secondary: [],
    pattern: "shrug",
    steps: [
      "Stand tall holding the weight at your sides with a straight back.",
      "Shrug your shoulders straight up toward your ears as high as possible.",
      "Hold the squeeze for a full second at the top.",
      "Lower with control. No rolling the shoulders."
    ]
  },
  {
    id: "overhead-barbell-shrug",
    name: "Overhead Barbell Shrug",
    equipment: "barbell",
    level: "advanced",
    primary: "traps",
    secondary: [],
    pattern: "shrug",
    steps: [
      "Stand tall holding the weight at your sides with a straight back.",
      "Shrug your shoulders straight up toward your ears as high as possible.",
      "Hold the squeeze for a full second at the top.",
      "Lower with control. No rolling the shoulders."
    ]
  },
  {
    id: "snatch-grip-high-pull",
    name: "Snatch-Grip High Pull",
    equipment: "barbell",
    level: "advanced",
    primary: "traps",
    secondary: ["shoulders"],
    pattern: "high-pull",
    steps: [
      "Start like a clean pull. Bar at mid-thigh after the first pull.",
      "Explode upward, shrugging hard and pulling the bar to chest height.",
      "Lead with your elbows, keeping the bar close.",
      "Lower with control back to the hang."
    ]
  },
  {
    id: "power-shrug",
    name: "Power Shrug",
    equipment: "barbell",
    level: "advanced",
    primary: "traps",
    secondary: [],
    pattern: "shrug",
    steps: [
      "Stand tall holding the weight at your sides with a straight back.",
      "Shrug your shoulders straight up toward your ears as high as possible.",
      "Hold the squeeze for a full second at the top.",
      "Lower with control. No rolling the shoulders."
    ]
  },
  {
    id: "kelso-shrug",
    name: "Kelso Shrug",
    equipment: "dumbbell",
    level: "intermediate",
    primary: "traps",
    secondary: [],
    pattern: "shrug",
    steps: [
      "Stand tall holding the weight at your sides with a straight back.",
      "Shrug your shoulders straight up toward your ears as high as possible.",
      "Hold the squeeze for a full second at the top.",
      "Lower with control. No rolling the shoulders."
    ]
  },
  {
    id: "hyperextension",
    name: "Hyperextension",
    equipment: "bodyweight",
    level: "beginner",
    primary: "lower-back",
    secondary: ["glutes"],
    pattern: "hyper",
    steps: [
      "Set up on the hyperextension bench with hips on the pad, feet anchored.",
      "Lower your torso with control until you feel a hamstring stretch.",
      "Raise back up until your body is in a straight line.",
      "Don't hyperextend past neutral at the top."
    ]
  },
  {
    id: "reverse-hyperextension",
    name: "Reverse Hyperextension",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "lower-back",
    secondary: ["glutes"],
    pattern: "hyper",
    steps: [
      "Set up on the hyperextension bench with hips on the pad, feet anchored.",
      "Lower your torso with control until you feel a hamstring stretch.",
      "Raise back up until your body is in a straight line.",
      "Don't hyperextend past neutral at the top."
    ]
  },
  {
    id: "superman-hold",
    name: "Superman Hold",
    equipment: "bodyweight",
    level: "beginner",
    primary: "lower-back",
    secondary: ["glutes"],
    pattern: "superman",
    steps: [
      "Lie face down with arms extended overhead.",
      "Lift your arms, chest, and legs off the floor simultaneously.",
      "Hold for 2–3 seconds, squeezing your glutes and lower back.",
      "Lower with control and repeat."
    ]
  },
  {
    id: "bird-dog",
    name: "Bird Dog",
    equipment: "bodyweight",
    level: "beginner",
    primary: "lower-back",
    secondary: ["abs"],
    pattern: "birddog",
    steps: [
      "Start on all fours, hands under shoulders, knees under hips.",
      "Extend opposite arm and leg until they're in line with your torso.",
      "Hold briefly without rotating your hips.",
      "Return with control and switch sides."
    ]
  },
  {
    id: "jefferson-curl",
    name: "Jefferson Curl",
    equipment: "barbell",
    level: "advanced",
    primary: "lower-back",
    secondary: ["hamstrings"],
    pattern: "jefferson",
    steps: [
      "Stand on a box or platform holding a light barbell.",
      "Slowly round down vertebra by vertebra, reaching toward your toes.",
      "Pause at the bottom, then reverse back up with control.",
      "Start very light. This is a mobility-strength hybrid."
    ]
  },
  {
    id: "kettlebell-deadlift",
    name: "Kettlebell Deadlift",
    equipment: "kettlebell",
    level: "beginner",
    primary: "lower-back",
    secondary: ["glutes", "hamstrings"],
    pattern: "deadlift",
    steps: [
      "Stand with the bar over mid-foot, shins close, grip just outside your legs.",
      "Set your back flat, chest up, and push the floor away with your legs.",
      "Stand tall, squeezing your glutes. Don't lean back.",
      "Reverse the motion: hips back, then knees, bar sliding down your legs."
    ]
  },
  {
    id: "burpee",
    name: "Burpee",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "full-body",
    secondary: ["chest", "quads"],
    pattern: "burpee",
    steps: [
      "From standing, drop into a squat and kick your feet back to a plank.",
      "Do a push-up, then jump your feet back under you.",
      "Explode upward into a jump with hands overhead.",
      "Land soft and flow straight into the next rep."
    ]
  },
  {
    id: "thruster",
    name: "Thruster",
    equipment: "barbell",
    level: "advanced",
    primary: "full-body",
    secondary: ["quads", "shoulders"],
    pattern: "thruster",
    steps: [
      "Hold the weight in a front rack and squat all the way down.",
      "Drive up explosively out of the squat.",
      "Use the momentum to press the weight overhead.",
      "Lower to the rack position and flow into the next rep."
    ]
  },
  {
    id: "clean-and-press",
    name: "Clean and Press",
    equipment: "barbell",
    level: "advanced",
    primary: "full-body",
    secondary: ["traps", "quads"],
    pattern: "clean-family",
    steps: [
      "Start with the weight on the floor, back flat, hips loaded.",
      "Explode upward, shrugging and pulling yourself under the weight.",
      "Catch it solidly. Front rack for cleans, overhead for snatches.",
      "Stand tall to finish, then lower with control."
    ]
  },
  {
    id: "power-snatch",
    name: "Power Snatch",
    equipment: "barbell",
    level: "advanced",
    primary: "full-body",
    secondary: ["traps", "quads"],
    pattern: "clean-family",
    steps: [
      "Start with the weight on the floor, back flat, hips loaded.",
      "Explode upward, shrugging and pulling yourself under the weight.",
      "Catch it solidly. Front rack for cleans, overhead for snatches.",
      "Stand tall to finish, then lower with control."
    ]
  },
  {
    id: "turkish-get-up",
    name: "Turkish Get-Up",
    equipment: "kettlebell",
    level: "advanced",
    primary: "full-body",
    secondary: ["shoulders"],
    pattern: "getup",
    steps: [
      "Lie on your back holding a kettlebell straight above your shoulder.",
      "Roll to your elbow, then your hand, keeping the bell locked overhead.",
      "Bridge your hips and sweep your leg under to a kneeling lunge.",
      "Stand up, then reverse every step to return."
    ]
  },
  {
    id: "man-maker",
    name: "Man Maker",
    equipment: "dumbbell",
    level: "advanced",
    primary: "full-body",
    secondary: ["chest", "back"],
    pattern: "manmaker",
    steps: [
      "Start in a plank holding dumbbells, do a push-up.",
      "Row one dumbbell, then the other, keeping hips square.",
      "Jump your feet to your hands and clean the weights up.",
      "Press overhead, then return to the floor."
    ]
  },
  {
    id: "devil-press",
    name: "Devil Press",
    equipment: "dumbbell",
    level: "advanced",
    primary: "full-body",
    secondary: ["quads"],
    pattern: "devil-press",
    steps: [
      "With dumbbells on the floor, do a burpee over them.",
      "At the bottom, grab the weights and swing them overhead.",
      "Stand tall with arms locked out.",
      "Lower with control and go again."
    ]
  },
  {
    id: "battle-ropes",
    name: "Battle Ropes",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "full-body",
    secondary: ["shoulders"],
    pattern: "ropes",
    steps: [
      "Stand athletic with a rope in each hand, knees soft.",
      "Drive alternating waves (or slams) with your whole body, not just arms.",
      "Keep your core braced and stay low.",
      "Work in intense intervals with full rest between."
    ]
  },
  {
    id: "sled-push",
    name: "Sled Push",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "full-body",
    secondary: ["quads", "glutes"],
    pattern: "sled",
    steps: [
      "Load the sled, get low behind it with arms extended.",
      "Drive with powerful leg steps, keeping your back flat.",
      "Push for the programmed distance as fast as you can.",
      "Rest fully, then go again."
    ]
  },
  {
    id: "bear-crawl",
    name: "Bear Crawl",
    equipment: "bodyweight",
    level: "beginner",
    primary: "full-body",
    secondary: ["shoulders", "abs"],
    pattern: "crawl",
    steps: [
      "Get on all fours with knees hovering just off the floor.",
      "Move opposite hand and foot together, keeping your back flat.",
      "Stay low and controlled. No sagging hips.",
      "Crawl for distance or time, breathing steadily."
    ]
  },
  {
    id: "sandbag-carry",
    name: "Sandbag Carry",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "full-body",
    secondary: ["traps"],
    pattern: "carry",
    steps: [
      "Pick up heavy weights and stand tall. Shoulders back, core braced.",
      "Walk with short, controlled steps, keeping your torso perfectly still.",
      "Breathe steadily as you go for distance or time.",
      "Set the weights down with a flat back, not a rounded one."
    ]
  },
  {
    id: "wall-ball",
    name: "Wall Ball",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "full-body",
    secondary: ["quads", "shoulders"],
    pattern: "wall-ball",
    steps: [
      "Hold a medicine ball at your chest facing a wall.",
      "Squat deep, then explode up, throwing the ball to the target.",
      "Catch it on the rebound and ride it into the next squat.",
      "Keep a steady rhythm. Don't pause at the top."
    ]
  },
  {
    id: "treadmill-run",
    name: "Treadmill Run",
    equipment: "bodyweight",
    level: "beginner",
    primary: "cardio",
    secondary: [],
    pattern: "cardio",
    steps: [
      "Warm up easy for 3–5 minutes before raising the intensity.",
      "Build to a challenging but sustainable pace. You should be breathing hard but in control.",
      "Hold your target effort for the programmed time or distance.",
      "Cool down easy for 3–5 minutes afterward."
    ]
  },
  {
    id: "rowing-machine",
    name: "Rowing Machine",
    equipment: "machine",
    level: "beginner",
    primary: "cardio",
    secondary: ["lats", "quads"],
    pattern: "cardio",
    steps: [
      "Warm up easy for 3–5 minutes before raising the intensity.",
      "Build to a challenging but sustainable pace. You should be breathing hard but in control.",
      "Hold your target effort for the programmed time or distance.",
      "Cool down easy for 3–5 minutes afterward."
    ]
  },
  {
    id: "stationary-bike",
    name: "Stationary Bike",
    equipment: "machine",
    level: "beginner",
    primary: "cardio",
    secondary: ["quads"],
    pattern: "cardio",
    steps: [
      "Warm up easy for 3–5 minutes before raising the intensity.",
      "Build to a challenging but sustainable pace. You should be breathing hard but in control.",
      "Hold your target effort for the programmed time or distance.",
      "Cool down easy for 3–5 minutes afterward."
    ]
  },
  {
    id: "stair-climber",
    name: "Stair Climber",
    equipment: "machine",
    level: "beginner",
    primary: "cardio",
    secondary: ["glutes", "calves"],
    pattern: "cardio",
    steps: [
      "Warm up easy for 3–5 minutes before raising the intensity.",
      "Build to a challenging but sustainable pace. You should be breathing hard but in control.",
      "Hold your target effort for the programmed time or distance.",
      "Cool down easy for 3–5 minutes afterward."
    ]
  },
  {
    id: "mountain-climbers",
    name: "Mountain Climbers",
    equipment: "bodyweight",
    level: "beginner",
    primary: "cardio",
    secondary: ["abs"],
    pattern: "climbers",
    steps: [
      "Start in a high plank with your core braced.",
      "Drive one knee toward your chest, then switch legs quickly.",
      "Keep your hips level. Don't bounce them up.",
      "Move fast but controlled for time or reps."
    ]
  },
  {
    id: "high-knees",
    name: "High Knees",
    equipment: "bodyweight",
    level: "beginner",
    primary: "cardio",
    secondary: ["quads"],
    pattern: "cardio",
    steps: [
      "Warm up easy for 3–5 minutes before raising the intensity.",
      "Build to a challenging but sustainable pace. You should be breathing hard but in control.",
      "Hold your target effort for the programmed time or distance.",
      "Cool down easy for 3–5 minutes afterward."
    ]
  },
  {
    id: "swimming",
    name: "Swimming",
    equipment: "bodyweight",
    level: "intermediate",
    primary: "cardio",
    secondary: ["lats"],
    pattern: "swim",
    steps: [
      "Warm up with easy laps before any hard efforts.",
      "Focus on long strokes and steady breathing rhythm.",
      "Build to your target pace or interval set.",
      "Cool down with easy swimming."
    ]
  },
  {
    id: "jumping-jacks",
    name: "Jumping Jacks",
    equipment: "bodyweight",
    level: "beginner",
    primary: "cardio",
    secondary: [],
    pattern: "cardio",
    steps: [
      "Warm up easy for 3–5 minutes before raising the intensity.",
      "Build to a challenging but sustainable pace. You should be breathing hard but in control.",
      "Hold your target effort for the programmed time or distance.",
      "Cool down easy for 3–5 minutes afterward."
    ]
  },
  {
    id: "sprint-intervals",
    name: "Sprint Intervals",
    equipment: "bodyweight",
    level: "advanced",
    primary: "cardio",
    secondary: ["quads"],
    pattern: "sprint",
    steps: [
      "Warm up thoroughly with easy jogging and drills.",
      "Sprint at near-max effort for the programmed distance or time.",
      "Walk or jog easy between efforts for full recovery.",
      "Stop the session if your form breaks down."
    ]
  },
  {
    id: "elliptical",
    name: "Elliptical",
    equipment: "machine",
    level: "beginner",
    primary: "cardio",
    secondary: [],
    pattern: "cardio",
    steps: [
      "Warm up easy for 3–5 minutes before raising the intensity.",
      "Build to a challenging but sustainable pace. You should be breathing hard but in control.",
      "Hold your target effort for the programmed time or distance.",
      "Cool down easy for 3–5 minutes afterward."
    ]
  },
  {
    id: "single-arm-dumbbell-row",
    name: "Single-Arm Dumbbell Row",
    equipment: "dumbbell",
    level: "beginner",
    primary: "back",
    secondary: ["biceps"],
    pattern: "row",
    steps: [
      "Hinge at the hips with a flat back, chest up, holding the weight with arms hanging.",
      "Pull the weight toward your lower ribs, driving your elbows behind you.",
      "Squeeze your shoulder blades together hard at the top.",
      "Lower with control to a full stretch and repeat."
    ]
  },
  {
    id: "dumbbell-floor-press",
    name: "Dumbbell Floor Press",
    equipment: "dumbbell",
    level: "beginner",
    primary: "chest",
    secondary: ["triceps"],
    pattern: "press-h",
    steps: [
      "Set up on the bench with feet planted, shoulder blades pinched, and a slight arch in your back.",
      "Unrack and lower the weight with control to mid-chest, elbows about 45° from your torso.",
      "Press up explosively without bouncing, keeping your wrists stacked over your elbows.",
      "Lock out softly at the top, then repeat. Exhale on the press."
    ]
  },
  {
    id: "dumbbell-romanian-deadlift",
    name: "Dumbbell Romanian Deadlift",
    equipment: "dumbbell",
    level: "beginner",
    primary: "hamstrings",
    secondary: ["glutes", "lower-back"],
    pattern: "rdl",
    steps: [
      "Stand holding the weight, feet hip-width, soft knees.",
      "Push your hips straight back, letting the weight slide down your thighs.",
      "Go until you feel a deep hamstring stretch, back flat.",
      "Drive your hips forward to stand, squeezing your glutes."
    ]
  }
];

const MUSCLES = {
  chest: "Chest",
  back: "Back",
  lats: "Lats",
  traps: "Traps",
  "lower-back": "Lower Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  forearms: "Forearms",
  abs: "Abs",
  obliques: "Obliques",
  glutes: "Glutes",
  quads: "Quads",
  hamstrings: "Hamstrings",
  calves: "Calves",
  "full-body": "Full Body",
  cardio: "Cardio"
};
