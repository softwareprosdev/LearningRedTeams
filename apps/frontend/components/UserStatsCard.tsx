'use client';

interface UserStatsCardProps {
  stats: {
    totalPoints: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    coursesCompleted: number;
    lessonsCompleted: number;
    quizzesCompleted: number;
    labsCompleted: number;
    challengesCompleted: number;
    perfectScores: number;
    nextLevelThreshold?: number;
    progressToNextLevel?: number;
    pointsNeededForNextLevel?: number;
    achievements?: any[];
  };
}

export function UserStatsCard({ stats }: UserStatsCardProps) {
  const progressPercentage = stats.pointsNeededForNextLevel
    ? Math.min(
        100,
        Math.round((stats.progressToNextLevel || 0) / stats.pointsNeededForNextLevel * 100)
      )
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-100">
      {/* Header with Level */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
          <p className="text-gray-600 text-sm">Keep learning to level up!</p>
        </div>
        <div className="text-center bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-full w-20 h-20 flex flex-col items-center justify-center shadow-lg">
          <div className="text-xs font-semibold">LEVEL</div>
          <div className="text-2xl font-bold">{stats.level}</div>
        </div>
      </div>

      {/* Points and Level Progress */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⭐</span>
            <span className="text-lg font-bold text-gray-900">
              {stats.totalPoints.toLocaleString()} Points
            </span>
          </div>
          {stats.nextLevelThreshold && (
            <span className="text-sm text-gray-600">
              Next: {stats.nextLevelThreshold.toLocaleString()}
            </span>
          )}
        </div>
        {stats.pointsNeededForNextLevel && (
          <div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-1 text-center">
              {progressPercentage}% to Level {stats.level + 1}
            </p>
          </div>
        )}
      </div>

      {/* Streak */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🔥</span>
            <span className="text-sm font-semibold text-gray-700">Current Streak</span>
          </div>
          <p className="text-3xl font-bold text-orange-600">{stats.currentStreak}</p>
          <p className="text-xs text-gray-600">days in a row</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🏆</span>
            <span className="text-sm font-semibold text-gray-700">Best Streak</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">{stats.longestStreak}</p>
          <p className="text-xs text-gray-600">days total</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatItem
          icon="📚"
          label="Courses"
          value={stats.coursesCompleted}
          color="blue"
        />
        <StatItem
          icon="📖"
          label="Lessons"
          value={stats.lessonsCompleted}
          color="green"
        />
        <StatItem
          icon="📝"
          label="Quizzes"
          value={stats.quizzesCompleted}
          color="yellow"
        />
        <StatItem
          icon="🔬"
          label="Labs"
          value={stats.labsCompleted}
          color="purple"
        />
        <StatItem
          icon="⚔️"
          label="Challenges"
          value={stats.challengesCompleted}
          color="red"
        />
        <StatItem
          icon="💯"
          label="Perfect Scores"
          value={stats.perfectScores}
          color="pink"
        />
      </div>

      {/* Recent Achievements Preview */}
      {stats.achievements && stats.achievements.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Recent Achievements</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {stats.achievements.slice(0, 5).map((achievement: any, index: number) => (
              <div
                key={index}
                className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-md"
                title={achievement.name}
              >
                <span className="text-2xl">{achievement.icon}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatItemProps {
  icon: string;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'pink';
}

function StatItem({ icon, label, value, color }: StatItemProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
    red: 'bg-red-50 text-red-700',
    pink: 'bg-pink-50 text-pink-700',
  };

  return (
    <div className={`${colorClasses[color]} p-3 rounded-lg text-center`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-bold">{value}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
    </div>
  );
}
