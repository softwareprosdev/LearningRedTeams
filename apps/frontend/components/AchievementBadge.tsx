'use client';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  tier: string;
  earnedAt?: Date | string | null;
  points?: number;
  size?: 'small' | 'medium' | 'large';
}

const tierColors = {
  bronze: 'bg-orange-100 border-orange-300 text-orange-800',
  silver: 'bg-gray-100 border-gray-300 text-gray-800',
  gold: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  platinum: 'bg-purple-100 border-purple-300 text-purple-800',
};

const tierGradients = {
  bronze: 'from-orange-400 to-orange-600',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600',
};

export function AchievementBadge({
  name,
  description,
  icon,
  tier,
  earnedAt,
  points,
  size = 'medium',
}: AchievementBadgeProps) {
  const isEarned = !!earnedAt;
  const tierColor = tierColors[tier as keyof typeof tierColors] || tierColors.bronze;
  const tierGradient = tierGradients[tier as keyof typeof tierGradients] || tierGradients.bronze;

  const sizeClasses = {
    small: {
      container: 'p-3',
      icon: 'text-3xl',
      name: 'text-sm',
      description: 'text-xs',
    },
    medium: {
      container: 'p-4',
      icon: 'text-4xl',
      name: 'text-base',
      description: 'text-sm',
    },
    large: {
      container: 'p-6',
      icon: 'text-5xl',
      name: 'text-lg',
      description: 'text-base',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div
      className={`relative rounded-lg border-2 transition-all ${
        isEarned
          ? `${tierColor} shadow-lg hover:shadow-xl transform hover:-translate-y-1`
          : 'bg-gray-50 border-gray-200 opacity-60 grayscale'
      } ${classes.container}`}
    >
      {/* Earned indicator */}
      {isEarned && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
        </div>
      )}

      {/* Icon */}
      <div className="flex justify-center mb-2">
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-br ${
            isEarned ? tierGradient : 'from-gray-300 to-gray-400'
          } flex items-center justify-center shadow-md`}
        >
          <span className={classes.icon}>{icon}</span>
        </div>
      </div>

      {/* Content */}
      <div className="text-center">
        <h3 className={`font-bold ${classes.name} mb-1`}>{name}</h3>
        <p className={`${classes.description} text-gray-600`}>{description}</p>

        {/* Metadata */}
        <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-500">
          {points !== undefined && points > 0 && (
            <div className="flex items-center gap-1">
              <span>⭐</span>
              <span>{points} pts</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="capitalize">{tier}</span>
          </div>
        </div>

        {/* Earned date */}
        {isEarned && earnedAt && (
          <div className="mt-2 text-xs text-gray-500">
            Earned {new Date(earnedAt).toLocaleDateString()}
          </div>
        )}

        {/* Locked state */}
        {!isEarned && (
          <div className="mt-2 text-xs text-gray-400 flex items-center justify-center gap-1">
            <span>🔒</span>
            <span>Locked</span>
          </div>
        )}
      </div>
    </div>
  );
}
