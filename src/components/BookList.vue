<template>
  <div class="card">
    <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
      <h2 class="mb-0">Book List</h2>
      <div>
        <button class="btn btn-sm btn-light me-2" @click="showQueryForm = !showQueryForm">
          <i class="bi bi-funnel"></i> Advanced Query
        </button>
        <button class="btn btn-sm btn-light" @click="fetchBooks()">
          <i class="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>
    </div>
    
    <!-- Advanced Query Form -->
    <div class="card-body" v-if="showQueryForm">
      <form @submit.prevent="applyQuery" class="row g-3">
        <div class="col-md-4">
          <label class="form-label">Field</label>
          <select v-model="queryField" class="form-select">
            <option value="isbn">ISBN</option>
            <option value="name">Book Name</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Operator</label>
          <select v-model="queryOperator" class="form-select">
            <option value="==">Equal</option>
            <option value=">">Greater Than</option>
            <option value="<">Less Than</option>
            <option value=">=">Greater Than or Equal</option>
            <option value="<=">Less Than or Equal</option>
          </select>
        </div>
        <div class="col-md-5">
          <label class="form-label">Value</label>
          <input type="text" v-model="queryValue" class="form-control" placeholder="Enter query value">
        </div>
        <div class="col-md-4">
          <label class="form-label">Sort Field</label>
          <select v-model="orderByField" class="form-select">
            <option value="">No Sorting</option>
            <option value="isbn">ISBN</option>
            <option value="name">Book Name</option>
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label">Sort Direction</label>
          <select v-model="orderDirection" class="form-select">
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
        <div class="col-md-5">
          <label class="form-label">Limit Count</label>
          <input type="number" v-model.number="limitCount" class="form-control" min="1">
        </div>
        <div class="col-12 mt-3">
          <button type="submit" class="btn btn-primary me-2">Apply Query</button>
          <button type="button" class="btn btn-secondary" @click="resetQuery">Reset</button>
        </div>
      </form>
    </div>
    
    <!-- Book List -->
    <div class="card-body">
      <div v-if="loading" class="text-center py-3">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2">Loading...</p>
      </div>
      
      <div v-else-if="books.length === 0" class="text-center py-3">
        <p class="text-muted">No books found</p>
      </div>
      
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>ISBN</th>
              <th>Book Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="book in books" :key="book.id">
              <td>{{ book.isbn }}</td>
              <td>
                <span v-if="editingBook && editingBook.id === book.id">
                  <input type="text" v-model="editingBook.name" class="form-control form-control-sm">
                </span>
                <span v-else>{{ book.name }}</span>
              </td>
              <td>
                <div v-if="editingBook && editingBook.id === book.id">
                  <button class="btn btn-sm btn-success me-1" @click="updateBook(book.id)">
                    <i class="bi bi-check"></i>
                  </button>
                  <button class="btn btn-sm btn-secondary" @click="cancelEdit()">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
                <div v-else>
                  <button class="btn btn-sm btn-primary me-1" @click="startEdit(book)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-danger" @click="confirmDelete(book.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import db from '../firebase/init.js';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc 
} from 'firebase/firestore';

export default {
  setup() {
    const books = ref([]);
    const loading = ref(false);
    const editingBook = ref(null);
    const showQueryForm = ref(false);
    
    // Query parameters
    const queryField = ref('isbn');
    const queryOperator = ref('>');
    const queryValue = ref('0');
    const orderByField = ref('');
    const orderDirection = ref('asc');
    const limitCount = ref(10);

    // Fetch book list
    const fetchBooks = async () => {
      try {
        loading.value = true;
        
        // Build query
        let q = collection(db, 'books');
        
        // Apply query conditions
        if (queryField.value && queryOperator.value && queryValue.value !== '') {
          let value = queryField.value === 'isbn' ? Number(queryValue.value) : queryValue.value;
          q = query(q, where(queryField.value, queryOperator.value, value));
        }
        
        // Apply sorting
        if (orderByField.value) {
          q = query(q, orderBy(orderByField.value, orderDirection.value));
        }
        
        // Apply limit
        if (limitCount.value > 0) {
          q = query(q, limit(limitCount.value));
        }
        
        const querySnapshot = await getDocs(q);
        const booksArray = [];
        querySnapshot.forEach((doc) => {
          booksArray.push({ id: doc.id, ...doc.data() });
        });
        books.value = booksArray;
      } catch (error) {
        console.error('Error fetching books: ', error);
        alert('Failed to fetch book list: ' + error.message);
      } finally {
        loading.value = false;
      }
    };

    // Apply query
    const applyQuery = () => {
      fetchBooks();
    };

    // Reset query
    const resetQuery = () => {
      queryField.value = 'isbn';
      queryOperator.value = '>';
      queryValue.value = '0';
      orderByField.value = '';
      orderDirection.value = 'asc';
      limitCount.value = 10;
      fetchBooks();
    };

    // Start editing
    const startEdit = (book) => {
      editingBook.value = { ...book };
    };

    // Cancel editing
    const cancelEdit = () => {
      editingBook.value = null;
    };

    // Update book
    const updateBook = async (bookId) => {
      try {
        if (!editingBook.value) return;
        
        const bookRef = doc(db, 'books', bookId);
        await updateDoc(bookRef, {
          name: editingBook.value.name
        });
        
        alert('Book updated successfully!');
        editingBook.value = null;
        fetchBooks();
      } catch (error) {
        console.error('Error updating book: ', error);
        alert('Failed to update book: ' + error.message);
      }
    };

    // Confirm deletion
    const confirmDelete = (bookId) => {
      if (confirm('Are you sure you want to delete this book?')) {
        deleteBook(bookId);
      }
    };

    // Delete book
    const deleteBook = async (bookId) => {
      try {
        const bookRef = doc(db, 'books', bookId);
        await deleteDoc(bookRef);
        
        alert('Book deleted successfully!');
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book: ', error);
        alert('Failed to delete book: ' + error.message);
      }
    };

    onMounted(() => {
      fetchBooks();
    });

    return {
      books,
      loading,
      editingBook,
      showQueryForm,
      queryField,
      queryOperator,
      queryValue,
      orderByField,
      orderDirection,
      limitCount,
      fetchBooks,
      applyQuery,
      resetQuery,
      startEdit,
      cancelEdit,
      updateBook,
      confirmDelete
    };
  }
};
</script>

<style scoped>
.card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  margin-bottom: 1.5rem;
}

.table th {
  background-color: #f8f9fa;
}
</style>
