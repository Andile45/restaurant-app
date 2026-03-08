import { useMenuItems } from './items/useMenuItems';
import { ItemsTable } from './items/ItemsTable';
import { ItemFormModal } from './items/ItemFormModal';

export const Items: React.FC = () => {
  const {
    items,
    categories,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    showAddModal,
    editingItem,
    formData,
    setFormData,
    saving,
    handleAdd,
    handleEdit,
    handleToggleAvailability,
    handleSave,
    closeModal,
  } = useMenuItems();

  if (loading && items.length === 0) {
    return (
      <div className="p-8">
        <div className="heading text-text-primary mb-6">Menu &gt; Items</div>
        <div className="body text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <ItemsTable
        items={items}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onToggleAvailability={handleToggleAvailability}
      />

      {showAddModal && (
        <ItemFormModal
          editingItem={editingItem}
          formData={formData}
          onFormDataChange={setFormData}
          categories={categories}
          onClose={closeModal}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </div>
  );
};
