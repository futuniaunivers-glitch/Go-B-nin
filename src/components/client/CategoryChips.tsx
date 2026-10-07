import React from 'react';
import { Category } from '../../types';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => {
  const activeCategories = categories.filter((c) => c.isActive);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar py-1">
      <button
        onClick={() => onSelectCategory(null)}
        className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          selectedCategoryId === null
            ? 'bg-zinc-950 text-white shadow-2xs'
            : 'bg-white text-zinc-700 border border-zinc-200 hover:border-violet-300 hover:bg-violet-50/30'
        }`}
      >
        Toutes les catégories
      </button>

      {activeCategories.map((cat) => {
        const isSelected = selectedCategoryId === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`shrink-0 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              isSelected
                ? 'bg-violet-700 text-white shadow-2xs'
                : 'bg-white text-zinc-700 border border-zinc-200 hover:border-violet-300 hover:bg-violet-50/30'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
