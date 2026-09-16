import React from 'react';
import { PopularDish } from '../../types';

interface PopularDishesProps {
  dishes: PopularDish[];
  onSelectDish?: (dish: PopularDish) => void;
}

export const PopularDishes: React.FC<PopularDishesProps> = ({ dishes, onSelectDish }) => {
  return (
    <div className="bg-surface-container-low rounded-xl p-space-md sm:p-space-lg shadow-md flex flex-col gap-space-md border border-surface-container-high/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">
            Popular Today
          </h2>
          <span className="material-symbols-outlined text-primary text-[20px]">
            local_fire_department
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
          By Volume
        </span>
      </div>

      <div className="flex flex-col gap-space-sm">
        {dishes.map((dish) => (
          <div
            key={dish.id}
            onClick={() => onSelectDish?.(dish)}
            className="flex items-center justify-between p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer border border-surface-container-high/20"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0">
                <img
                  className="w-full h-full object-cover"
                  src={dish.imageUrl}
                  alt={dish.altText}
                  loading="lazy"
                />
                <span
                  className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full ring-1 ring-surface-container-lowest ${
                    dish.isVeg ? 'bg-secondary' : 'bg-error'
                  }`}
                  title={dish.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-label-lg text-label-lg text-on-surface truncate font-semibold">
                  {dish.name}
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {dish.ordersCount} orders
                </span>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="font-mono-metric text-on-surface font-semibold">
                ₹{dish.revenue.toLocaleString('en-IN')}
              </div>
              <span
                className={`font-label-sm text-label-sm font-medium ${
                  dish.isPositiveGrowth ? 'text-secondary font-bold' : 'text-on-surface-variant'
                }`}
              >
                {dish.growth}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
