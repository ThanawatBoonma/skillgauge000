import React from 'react';
import './StatCard.css';

// แก้ไขการรับ Props: รับแยกเป็นตัวๆ แทนที่จะรับเป็น object "stat"
const StatCard = ({ title, count, unit, icon, color, trend, onClick }) => {
    return (
        <div
            className={`stat-card stat-card--${color || 'blue'}`} // ใส่ fallback กัน error
            onClick={onClick}
        >
            <div className="stat-icon-wrapper">
                <span className="stat-icon">
                    {/* ถ้ามี Icon (Emoji) ให้แสดง ถ้าไม่มีให้แสดง SVG ตามสี */}
                    {icon ? icon : (
                      <>
                        {color === 'red' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M11 7h2v6h-2zm0 8h2v2h-2z"></path><path d="M12 22c5.51 0 10-4.49 10-10S17.51 2 12 2 2 6.49 2 12s4.49 10 10 10m0-18c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8"></path>
                        </svg>
                    )}
                    {color === 'orange' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
                            <path d="M13 7h-2v6h6v-2h-4z"></path>
                        </svg>
                    )}
                    {color === 'green' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z"></path>
                            <path d="M9.999 13.587 7.7 11.292l-1.412 1.416 3.713 3.705 7.294-7.295-1.414-1.414z"></path>
                        </svg>
                    )}
                    {color === 'blue' && (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2a2 2 0 1 0 0 4 2 2 0 1 0 0-4m-2 20h4v-7h2V8c0-.55-.45-1-1-1H9c-.55 0-1 .45-1 1v7h2z"></path>
                        </svg>
                    )}
                      </>
                    )}
                </span>
            </div>
            <div className="stat-card__content">
                <span className="stat-card__label">{title}</span>
                <div className="stat-card__value-group">
                    <span className="stat-card__value">{count}</span>
                    <span className="stat-card__unit">{unit}</span>
                </div>
                {trend && (
                    <div className="stat-card__insight">
                        {trend}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;