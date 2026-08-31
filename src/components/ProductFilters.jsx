function FilterGroup({ title, options, selected, onToggle, withDivider }) {
  if (options.length === 0) return null

  return (
    <div>
      <h3
        className={`font-label-md text-label-md text-on-surface-variant mb-sm uppercase tracking-wider ${
          withDivider ? 'mt-md border-t border-outline-variant pt-md' : ''
        }`}
      >
        {title}
      </h3>
      <div className="space-y-sm">
        {options.map((option) => (
          <label key={option} className="flex items-center gap-sm cursor-pointer group">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-outline-variant text-primary-container focus:ring-primary-container"
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
            />
            <span className="font-body-sm text-body-sm text-on-surface group-hover:text-primary transition-colors">
              {option}
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default function ProductFilters({
  categories,
  materials,
  techniques,
  selectedCategories,
  selectedMaterials,
  selectedTechniques,
  onToggleCategory,
  onToggleMaterial,
  onToggleTechnique,
  onClear,
}) {
  const hasActiveFilters =
    selectedCategories.length > 0 ||
    selectedMaterials.length > 0 ||
    selectedTechniques.length > 0

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-surface border border-outline-variant rounded-lg p-md shadow-sm md:sticky md:top-[104px]">
        <h2 className="font-headline-sm text-headline-sm text-primary mb-md flex items-center gap-sm border-b border-outline-variant pb-sm">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            filter_list
          </span>
          Filtros
        </h2>
        <div className="space-y-md">
          <FilterGroup
            title="Categoría"
            options={categories}
            selected={selectedCategories}
            onToggle={onToggleCategory}
          />
          <FilterGroup
            title="Material"
            options={materials}
            selected={selectedMaterials}
            onToggle={onToggleMaterial}
            withDivider
          />
          <FilterGroup
            title="Técnica"
            options={techniques}
            selected={selectedTechniques}
            onToggle={onToggleTechnique}
            withDivider
          />
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="mt-md w-full font-label-md text-label-md text-primary-container hover:text-primary transition-colors text-left"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </aside>
  )
}
