import { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/categoryService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { FaEdit, FaTrash, FaPlus, FaFolder, FaFolderOpen } from 'react-icons/fa';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null, preSelectedParentId = null) => {
    if (category) {
      // Editing existing category
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        parent_id: category.parent_id || ''
      });
    } else {
      // Adding new category (with optional pre-selected parent for subcategories)
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        parent_id: preSelectedParentId || ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      parent_id: ''
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await createCategory(formData);
        toast.success('Category created successfully');
      }
      fetchCategories();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      return;
    }

    try {
      await deleteCategory(categoryId);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error(error.message || 'Failed to delete category');
    }
  };

  // Organize categories into parent-child structure
  const getParentCategories = () => {
    return categories.filter(cat => !cat.parent_id);
  };

  const getSubcategories = (parentId) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  };

  return (
    <div className="flex">
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Categories</h1>
          <Button
            onClick={() => handleOpenModal()}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <FaPlus />
            <span>Add Category</span>
          </Button>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className="bg-white rounded-lg shadow-md">
            {/* Parent Categories */}
            {getParentCategories().length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg mb-4">No categories yet</p>
                <Button onClick={() => handleOpenModal()} variant="primary">
                  Add Your First Category
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {getParentCategories().map((parentCategory) => {
                  const subcategories = getSubcategories(parentCategory.id);
                  
                  return (
                    <div key={parentCategory.id} className="p-6">
                      {/* Parent Category */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <FaFolderOpen className="text-2xl text-blue-600" />
                          <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                              {parentCategory.name}
                            </h2>
                            {parentCategory.description && (
                              <p className="text-sm text-gray-600">{parentCategory.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {subcategories.length} subcategory(ies)
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={() => handleOpenModal(null, parentCategory.id)}
                            variant="secondary"
                            size="sm"
                            className="flex items-center space-x-1"
                            title="Add subcategory"
                          >
                            <FaPlus className="text-xs" />
                            <span>Add Sub</span>
                          </Button>
                          <Button
                            onClick={() => handleOpenModal(parentCategory)}
                            variant="secondary"
                            size="sm"
                            title="Edit category"
                          >
                            <FaEdit />
                          </Button>
                          <Button
                            onClick={() => handleDelete(parentCategory.id)}
                            variant="danger"
                            size="sm"
                            title="Delete category"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {subcategories.length > 0 && (
                        <div className="ml-12 space-y-3">
                          {subcategories.map((subcategory) => (
                            <div
                              key={subcategory.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <FaFolder className="text-lg text-gray-500" />
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    {subcategory.name}
                                  </h3>
                                  {subcategory.description && (
                                    <p className="text-sm text-gray-600">{subcategory.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  onClick={() => handleOpenModal(subcategory)}
                                  variant="secondary"
                                  size="sm"
                                >
                                  <FaEdit />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(subcategory.id)}
                                  variant="danger"
                                  size="sm"
                                >
                                  <FaTrash />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={
            editingCategory 
              ? 'Edit Category' 
              : formData.parent_id 
                ? `Add Subcategory under "${getCategoryName(formData.parent_id)}"`
                : 'Add New Category'
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter category name"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter category description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category (Optional - leave empty for main category)
              </label>
              <select
                name="parent_id"
                value={formData.parent_id}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={editingCategory && editingCategory.parent_id}
              >
                <option value="">None (Main Category)</option>
                {getParentCategories()
                  .filter(cat => !editingCategory || cat.id !== editingCategory.id) // Prevent category from being its own parent
                  .map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
              {formData.parent_id && (
                <p className="mt-1 text-sm text-gray-500">
                  This will be created as a subcategory under "{getCategoryName(formData.parent_id)}"
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" onClick={handleCloseModal} variant="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  );
};

export default ManageCategories;
