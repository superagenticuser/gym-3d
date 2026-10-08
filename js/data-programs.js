// Ready-to-use training programs for FORGE.
// Exercise ids must exist in EXERCISES. sets = number of sets, reps = label shown.
const PROGRAMS = [
  {
    id: "full-body-starter",
    name: "Full-Body Starter",
    tagline: "Learn the fundamentals with three full-body days per week.",
    level: "beginner",
    daysPerWeek: 3,
    weeks: 4,
    equipment: "Dumbbells + bodyweight",
    days: [
      { name: "Day 1 · Full Body A", exercises: [
        { id: "goblet-squat", sets: 3, reps: "10" },
        { id: "push-up", sets: 3, reps: "8" },
        { id: "chest-supported-dumbbell-row", sets: 3, reps: "10" },
        { id: "glute-bridge", sets: 3, reps: "12" },
        { id: "plank", sets: 3, reps: "30s" },
        { id: "standing-calf-raise", sets: 2, reps: "15" }
      ]},
      { name: "Day 2 · Full Body B", exercises: [
        { id: "dumbbell-romanian-deadlift", sets: 3, reps: "10" },
        { id: "dumbbell-shoulder-press", sets: 3, reps: "10" },
        { id: "single-arm-dumbbell-row", sets: 3, reps: "10 / side" },
        { id: "dumbbell-curl", sets: 2, reps: "12" },
        { id: "dumbbell-kickback", sets: 2, reps: "12" },
        { id: "bird-dog", sets: 2, reps: "8 / side" }
      ]},
      { name: "Day 3 · Full Body A", exercises: [
        { id: "goblet-squat", sets: 3, reps: "10" },
        { id: "push-up", sets: 3, reps: "8" },
        { id: "chest-supported-dumbbell-row", sets: 3, reps: "10" },
        { id: "glute-bridge", sets: 3, reps: "12" },
        { id: "plank", sets: 3, reps: "30s" },
        { id: "standing-calf-raise", sets: 2, reps: "15" }
      ]}
    ]
  }


,
  {
    id: "push-pull-legs",
    name: "Push / Pull / Legs",
    tagline: "The classic hypertrophy split. Run it 3 to 6 days per week.",
    level: "intermediate",
    daysPerWeek: 6,
    weeks: 8,
    equipment: "Full gym",
    days: [
      { name: "Push", exercises: [
        { id: "barbell-bench-press", sets: 4, reps: "6" },
        { id: "overhead-barbell-press", sets: 3, reps: "8" },
        { id: "incline-dumbbell-press", sets: 3, reps: "10" },
        { id: "lateral-raise", sets: 3, reps: "12" },
        { id: "tricep-rope-pushdown", sets: 3, reps: "12" }
      ]},
      { name: "Pull", exercises: [
        { id: "deadlift", sets: 4, reps: "5" },
        { id: "pull-up", sets: 4, reps: "max" },
        { id: "bent-over-barbell-row", sets: 3, reps: "10" },
        { id: "face-pull", sets: 3, reps: "15" },
        { id: "barbell-curl", sets: 3, reps: "10" }
      ]},
      { name: "Legs", exercises: [
        { id: "back-squat", sets: 4, reps: "6" },
        { id: "romanian-deadlift", sets: 3, reps: "8" },
        { id: "leg-press", sets: 3, reps: "10" },
        { id: "lying-leg-curl", sets: 3, reps: "12" },
        { id: "standing-calf-raise", sets: 4, reps: "15" }
      ]}
    ]
  }


,
  {
    id: "upper-lower",
    name: "Upper / Lower",
    tagline: "Train everything twice per week across four focused days.",
    level: "intermediate",
    daysPerWeek: 4,
    weeks: 8,
    equipment: "Full gym",
    days: [
      { name: "Upper A · Strength", exercises: [
        { id: "barbell-bench-press", sets: 4, reps: "6" },
        { id: "bent-over-barbell-row", sets: 4, reps: "8" },
        { id: "dumbbell-shoulder-press", sets: 3, reps: "10" },
        { id: "pull-up", sets: 3, reps: "max" },
        { id: "dumbbell-curl", sets: 2, reps: "12" }
      ]},
      { name: "Lower A · Strength", exercises: [
        { id: "back-squat", sets: 4, reps: "6" },
        { id: "romanian-deadlift", sets: 3, reps: "8" },
        { id: "leg-press", sets: 3, reps: "10" },
        { id: "standing-calf-raise", sets: 3, reps: "15" }
      ]},
      { name: "Upper B · Volume", exercises: [
        { id: "overhead-barbell-press", sets: 4, reps: "8" },
        { id: "incline-dumbbell-press", sets: 3, reps: "10" },
        { id: "single-arm-dumbbell-row", sets: 3, reps: "10 / side" },
        { id: "lateral-raise", sets: 3, reps: "12" },
        { id: "tricep-rope-pushdown", sets: 3, reps: "12" }
      ]},
      { name: "Lower B · Volume", exercises: [
        { id: "deadlift", sets: 3, reps: "5" },
        { id: "front-squat", sets: 3, reps: "8" },
        { id: "bulgarian-split-squat", sets: 3, reps: "10 / side" },
        { id: "seated-calf-raise", sets: 3, reps: "15" }
      ]}
    ]
  }


,
  {
    id: "strength-5x5",
    name: "5×5 Strength",
    tagline: "Simple, heavy and effective. Add weight every session.",
    level: "intermediate",
    daysPerWeek: 3,
    weeks: 12,
    equipment: "Barbell",
    days: [
      { name: "Workout A", exercises: [
        { id: "back-squat", sets: 5, reps: "5" },
        { id: "barbell-bench-press", sets: 5, reps: "5" },
        { id: "bent-over-barbell-row", sets: 5, reps: "5" }
      ]},
      { name: "Workout B", exercises: [
        { id: "back-squat", sets: 5, reps: "5" },
        { id: "overhead-barbell-press", sets: 5, reps: "5" },
        { id: "deadlift", sets: 1, reps: "5" }
      ]}
    ]
  }


,
  {
    id: "dumbbell-home",
    name: "Dumbbell-Only Home",
    tagline: "One pair of dumbbells. Full-body results at home.",
    level: "beginner",
    daysPerWeek: 3,
    weeks: 6,
    equipment: "Dumbbells",
    days: [
      { name: "Full Body", exercises: [
        { id: "goblet-squat", sets: 3, reps: "12" },
        { id: "dumbbell-floor-press", sets: 3, reps: "10" },
        { id: "single-arm-dumbbell-row", sets: 3, reps: "10 / side" },
        { id: "dumbbell-romanian-deadlift", sets: 3, reps: "10" },
        { id: "dumbbell-shoulder-press", sets: 3, reps: "10" },
        { id: "dumbbell-curl", sets: 2, reps: "12" },
        { id: "dumbbell-kickback", sets: 2, reps: "12" },
        { id: "plank", sets: 3, reps: "45s" }
      ]}
    ]
  }


,
  {
    id: "hiit-conditioning",
    name: "HIIT Conditioning",
    tagline: "Build your engine. Three to four rounds with minimal rest.",
    level: "intermediate",
    daysPerWeek: 3,
    weeks: 4,
    equipment: "Bodyweight + kettlebell",
    days: [
      { name: "Circuit · 3 to 4 rounds", exercises: [
        { id: "burpee", sets: 1, reps: "40s" },
        { id: "kettlebell-swing", sets: 1, reps: "40s" },
        { id: "mountain-climbers", sets: 1, reps: "40s" },
        { id: "battle-ropes", sets: 1, reps: "30s" },
        { id: "box-jump", sets: 1, reps: "30s" },
        { id: "bear-crawl", sets: 1, reps: "40s" },
        { id: "jump-rope", sets: 1, reps: "60s" },
        { id: "devil-press", sets: 1, reps: "30s" }
      ]}
    ]
  }


,
  {
    id: "powerbuilding",
    name: "Powerbuilding",
    tagline: "Heavy compounds for strength, volume work for size. 4 days.",
    level: "intermediate",
    daysPerWeek: 4,
    weeks: 8,
    equipment: "Full gym",
    days: [
      { name: "Day 1 · Upper Strength", exercises: [
        { id: "barbell-bench-press", sets: 5, reps: "5" },
        { id: "bent-over-barbell-row", sets: 4, reps: "8" },
        { id: "dumbbell-shoulder-press", sets: 3, reps: "10" },
        { id: "lat-pulldown", sets: 3, reps: "12" }
      ]},
      { name: "Day 2 · Lower Strength", exercises: [
        { id: "back-squat", sets: 5, reps: "5" },
        { id: "romanian-deadlift", sets: 3, reps: "10" },
        { id: "leg-press", sets: 3, reps: "12" },
        { id: "plank", sets: 3, reps: "60s" }
      ]},
      { name: "Day 3 · Upper Volume", exercises: [
        { id: "barbell-bench-press", sets: 4, reps: "10" },
        { id: "pull-up", sets: 4, reps: "8" },
        { id: "dumbbell-shoulder-press", sets: 3, reps: "12" },
        { id: "push-up", sets: 3, reps: "15" }
      ]},
      { name: "Day 4 · Lower Volume", exercises: [
        { id: "deadlift", sets: 4, reps: "6" },
        { id: "front-squat", sets: 3, reps: "10" },
        { id: "bulgarian-split-squat", sets: 3, reps: "10 / side" },
        { id: "plank", sets: 3, reps: "60s" }
      ]}
    ]
  }


,
  {
    id: "calisthenics",
    name: "Calisthenics Skills",
    tagline: "Master your bodyweight. Progress from basics to advanced skills.",
    level: "beginner",
    daysPerWeek: 3,
    weeks: 8,
    equipment: "Bodyweight + pull-up bar",
    days: [
      { name: "Day 1 · Push", exercises: [
        { id: "push-up", sets: 4, reps: "12" },
        { id: "plank", sets: 3, reps: "60s" },
        { id: "push-up", sets: 3, reps: "8" }
      ]},
      { name: "Day 2 · Pull", exercises: [
        { id: "pull-up", sets: 4, reps: "6" },
        { id: "plank", sets: 3, reps: "60s" }
      ]},
      { name: "Day 3 · Legs + Core", exercises: [
        { id: "goblet-squat", sets: 4, reps: "15" },
        { id: "bulgarian-split-squat", sets: 3, reps: "10 / side" },
        { id: "plank", sets: 3, reps: "60s" }
      ]}
    ]
  }


,
  {
    id: "runner-strength",
    name: "Runner's Strength",
    tagline: "Injury-proof your running. 2 days, single-leg focus.",
    level: "beginner",
    daysPerWeek: 2,
    weeks: 6,
    equipment: "Dumbbells + bodyweight",
    days: [
      { name: "Day 1 · Legs", exercises: [
        { id: "goblet-squat", sets: 3, reps: "12" },
        { id: "bulgarian-split-squat", sets: 3, reps: "10 / side" },
        { id: "romanian-deadlift", sets: 3, reps: "10" },
        { id: "plank", sets: 3, reps: "45s" }
      ]},
      { name: "Day 2 · Full Body", exercises: [
        { id: "push-up", sets: 3, reps: "12" },
        { id: "goblet-squat", sets: 3, reps: "12" },
        { id: "dumbbell-shoulder-press", sets: 3, reps: "10" },
        { id: "plank", sets: 3, reps: "45s" }
      ]}
    ]
  }


];
