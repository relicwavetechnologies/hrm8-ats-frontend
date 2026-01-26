import { useEffect, useState } from 'react';
import { Badge, Trophy, Star, Award, Sparkles } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { toast } from 'sonner';

interface AchievementData {
  type: 'badge' | 'level-up' | 'points' | 'achievement';
  title: string;
  description: string;
  icon?: string;
  points?: number;
  level?: number;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export function showAchievementNotification(data: AchievementData) {
  const getIcon = () => {
    if (data.icon) {
      const Icon = (LucideIcons as any)[data.icon];
      if (Icon) return <Icon className="h-5 w-5" />;
    }
    
    switch (data.type) {
      case 'badge':
        return <Badge className="h-5 w-5" />;
      case 'level-up':
        return <Trophy className="h-5 w-5" />;
      case 'achievement':
        return <Award className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getRarityStyles = () => {
    switch (data.rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white';
      case 'epic':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'rare':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  const getAnimationClass = () => {
    if (data.type === 'level-up') return 'animate-bounce';
    if (data.rarity === 'legendary' || data.rarity === 'epic') return 'animate-pulse';
    return '';
  };

  toast.custom(
    (t) => (
      <div
        className={`${getRarityStyles()} rounded-lg shadow-lg p-4 max-w-md flex items-start gap-3 ${getAnimationClass()}`}
      >
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-bold text-sm">{data.title}</h4>
            {data.rarity && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20">
                {data.rarity}
              </span>
            )}
          </div>
          <p className="text-sm opacity-90">{data.description}</p>
          {data.points && (
            <p className="text-xs mt-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              +{data.points} XP
            </p>
          )}
          {data.level && (
            <p className="text-xs mt-2 flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              Level {data.level}
            </p>
          )}
        </div>
      </div>
    ),
    {
      duration: data.rarity === 'legendary' || data.type === 'level-up' ? 5000 : 4000,
      position: 'top-center',
    }
  );
}

// Confetti effect for major achievements
export function showConfetti() {
  // This would integrate with a confetti library like canvas-confetti
  // For now, we'll use the toast system
  const confettiColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
  const randomColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
  
  // In a real implementation, you would use canvas-confetti or similar
}

// Point gain animation
export function showPointsGained(points: number, element?: HTMLElement) {
  if (element) {
    const floatingText = document.createElement('div');
    floatingText.className = 'absolute pointer-events-none text-yellow-500 font-bold text-lg animate-fade-in';
    floatingText.style.top = '0';
    floatingText.style.left = '50%';
    floatingText.style.transform = 'translateX(-50%)';
    floatingText.textContent = `+${points} XP`;
    
    element.style.position = 'relative';
    element.appendChild(floatingText);
    
    setTimeout(() => {
      floatingText.style.animation = 'fade-out 0.5s ease-out forwards';
      floatingText.style.transform = 'translateX(-50%) translateY(-20px)';
    }, 100);
    
    setTimeout(() => {
      element.removeChild(floatingText);
    }, 1500);
  }
}

export function AchievementNotification() {
  // This component could be used for persistent achievement displays
  // For now, we're using the toast system
  return null;
}
