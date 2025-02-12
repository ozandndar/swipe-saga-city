export const GAME_RULES = {
  chapters: {
    length: 30, // days per chapter
    timePerDay: {
      early: {
        days: 10,
        duration: 120000, // 2 minutes
      },
      mid: {
        days: 20,
        duration: 105000, // 1:45 minutes
      },
      late: {
        days: 30,
        duration: 90000, // 1:30 minutes
      }
    }
  },
  time: {
    dayDuration: 30000, // 30 seconds
    decisionsPerDay: 3,
  },
  penalties: {
    timeExpired: {
      environment: -10,
      reasonKey: 'penalties.timeExpired'
    },
    dayIncomplete: {
      environment: -10,
      reasonKey: 'penalties.dayIncomplete'
    },
    powerGridFailed: {
      environment: -10,
      reasonKey: 'penalties.powerGridFailed'
    }
  },
  miniGames: {
    powerGrid: {
      timeLimit: 25000, // 25 seconds
      penalties: {
        failure: {
          environment: -10,
          reasonKey: 'penalties.powerGridFailed'
        }
      }
    }
  },
  thresholds: {
    criticalLevel: 0, // Level at which game over triggers
  }
} as const; 