import { useCategories } from './categories/useCategories';
import { CategoriesTable } from './categories/CategoriesTable';
import { CategoryModal } from './categories/CategoryModal';

export const Categories: React.FC = () => {
  const {
    categories,
    loading,
    showAddModal,
    editingCategory,
    categoryName,
    setCategoryName,
    handleAdd,
    handleEdit,
    handleSave,
    handleDelete,
    closeModal,
  } = useCategories();

  if (loading) {
    return (
      <div className="p-8">
        <div className="heading text-text-primary mb-6">Menu &gt; Categories</div>
        <div className="body text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <CategoriesTable
        categories={categories}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {showAddModal && (
        <CategoryModal
          editingCategory={editingCategory}
          categoryName={categoryName}
          onCategoryNameChange={setCategoryName}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};
