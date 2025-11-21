import React from 'react';
import PropTypes from 'prop-types';
import { CCContextConsumer } from '../../containers/Application';
import './styles.scss';

const LessonNavigation = ({ currentActivity, allActivities, onNavigate }) => {
  // Find current activity index
  let currentIndex = -1;
  
  if (currentActivity && allActivities.length > 0) {
    currentIndex = allActivities.findIndex(activity => {
      const activityIdNum = parseInt(activity.id);
      const currentIdNum = parseInt(currentActivity?.id);
      return activityIdNum === currentIdNum || activity.id === currentActivity?.id;
    });
  }
  
  // If current activity is not found, use first activity as fallback
  if (currentIndex === -1 && allActivities.length > 0) {
    currentIndex = 0;
  }
  
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < allActivities.length - 1;
  
  const handlePrevious = () => {
    if (hasPrevious) {
      const previousActivity = allActivities[currentIndex - 1];
      onNavigate(previousActivity);
    }
  };
  
  const handleNext = () => {
    if (hasNext) {
      const nextActivity = allActivities[currentIndex + 1];
      onNavigate(nextActivity);
    }
  };

  return (
    <div className="lesson-navigation">
      <button 
        className={`nav-button back-button ${!hasPrevious ? 'disabled' : ''}`}
        onClick={handlePrevious}
        disabled={!hasPrevious}
        title="Previous Activity"
      >
        <span className="arrow">←</span>
        <span className="text">Back</span>
      </button>
      
      <button 
        className={`nav-button next-button ${!hasNext ? 'disabled' : ''}`}
        onClick={handleNext}
        disabled={!hasNext}
        title="Next Activity"
      >
        <span className="text">Next</span>
        <span className="arrow">→</span>
      </button>
    </div>
  );
};

LessonNavigation.propTypes = {
  currentActivity: PropTypes.object,
  allActivities: PropTypes.array.isRequired,
  onNavigate: PropTypes.func.isRequired,
};

export default LessonNavigation;
