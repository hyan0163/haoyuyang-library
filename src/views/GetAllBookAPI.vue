<template>
  <div class="api-container">
    <h1>All Books API</h1>
    <div class="controls">
      <button @click="fetchAllBooks" class="refresh-btn">Refresh Data</button>
      <button @click="toggleDataSource" class="toggle-btn">
        {{ useFirebase ? 'Use Mock Data' : 'Use Firebase Data' }}
      </button>
      <button v-if="useFirebase" @click="showAddForm = !showAddForm" class="add-btn">
        {{ showAddForm ? 'Hide Add Form' : 'Add Test Data' }}
      </button>
    </div>
    
    <!-- Add Test Data Form -->
    <div v-if="showAddForm && useFirebase" class="add-form">
      <h3>Add Test Books to Firebase</h3>
      <div class="form-group">
        <label>ISBN:</label>
        <input type="text" v-model="newBook.isbn" class="form-control" placeholder="Enter ISBN">
      </div>
      <div class="form-group">
        <label>Book Name:</label>
        <input type="text" v-model="newBook.name" class="form-control" placeholder="Enter book name">
      </div>
      <button @click="addTestBook" class="submit-btn" :disabled="addingBook">{{ addingBook ? 'Adding...' : 'Add to Firebase' }}</button>
      <div v-if="addBookResult" class="add-result" :class="{ 'success': addBookResult.success, 'error': !addBookResult.success }">
        {{ addBookResult.message }}
      </div>
    </div>
    
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading book data...</p>
    </div>
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
    </div>
    <div v-else-if="apiResponse" class="api-response">
      <div class="data-source-info">
        <p>Data Source: <strong>{{ useFirebase ? 'Firebase Firestore' : 'Mock Data' }}</strong></p>
      </div>
      <pre>{{ JSON.stringify(apiResponse, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import db from '../firebase/init.js';
import { collection, getDocs, query, limit, addDoc, serverTimestamp } from 'firebase/firestore';

export default {
  setup() {
    const books = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const apiResponse = ref(null);
    const useFirebase = ref(true); // Default to use Firebase data
    const showAddForm = ref(false); // Control the display of add form
    const addingBook = ref(false); // Adding book status
    const addBookResult = ref(null); // Add result
    
    // New book data
    const newBook = ref({
      isbn: '',
      name: ''
    });
    
    // Mock data
    const mockBooks = [
      { id: 'mock1', isbn: '9781234567897', name: 'Mock Book 1' },
      { id: 'mock2', isbn: '9781234567898', name: 'Mock Book 2' },
      { id: 'mock3', isbn: '9781234567899', name: 'Mock Book 3' },
      { id: 'mock4', isbn: '9781234567890', name: 'Mock Book 4' },
      { id: 'mock5', isbn: '9781234567891', name: 'Mock Book 5' }
    ];
    
    // Toggle data source
    const toggleDataSource = () => {
      useFirebase.value = !useFirebase.value;
      if (useFirebase.value) {
        showAddForm.value = false; // Reset form state when switching to Firebase
      }
      fetchAllBooks();
    };
    
    // Add test book to Firebase
    const addTestBook = async () => {
      // Validate input
      if (!newBook.value.isbn || !newBook.value.name) {
        addBookResult.value = {
          success: false,
          message: 'ISBN and book name cannot be empty'
        };
        return;
      }
      
      try {
        addingBook.value = true;
        addBookResult.value = null;
        
        // Prepare book data
        const bookData = {
          isbn: newBook.value.isbn.trim(),
          name: newBook.value.name.trim(),
          createdAt: serverTimestamp()
        };
        
        console.log('Attempting to add book to Firestore:', bookData);
        
        // Add to Firestore
        const booksCollection = collection(db, 'books');
        const docRef = await addDoc(booksCollection, bookData);
        
        console.log('Book added with ID:', docRef.id);
        
        // Reset form
        newBook.value = {
          isbn: '',
          name: ''
        };
        
        // Set success message
        addBookResult.value = {
          success: true,
          message: `Book added successfully! ID: ${docRef.id}`
        };
        
        // Refresh book list
        fetchAllBooks();
      } catch (err) {
        console.error('Error adding book:', err);
        addBookResult.value = {
          success: false,
          message: `Add failed: ${err.message}`
        };
      } finally {
        addingBook.value = false;
      }
    };

    const fetchAllBooks = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        // If using mock data
        if (!useFirebase.value) {
          console.log('Using mock data instead of Firebase');
          books.value = [...mockBooks];
          
          // Format API response
          apiResponse.value = {
            success: true,
            data: {
              totalBooks: books.value.length,
              books: books.value.map(book => ({
                id: book.id,
                isbn: book.isbn || 'Unknown ISBN',
                name: book.name || 'Unknown book name',
                timestamp: new Date().toISOString()
              })),
              source: 'Mock Data'
            }
          };
          loading.value = false;
          return;
        }
        
        console.log('Attempting to fetch books from Firestore...');
        console.log('Database reference:', db);
        
        // Create a simple query, limit to 10 records
        const booksCollection = collection(db, 'books');
        const q = query(booksCollection, limit(10));
        console.log('Books query:', q);
        
        // Execute query
        const querySnapshot = await getDocs(q);
        console.log('Query snapshot received, empty?', querySnapshot.empty);
        console.log('Number of documents:', querySnapshot.size);
        
        // If no documents found, add a test document to API response
        if (querySnapshot.empty) {
          apiResponse.value = {
            success: true,
            data: {
              totalBooks: 0,
              books: [],
              debug: {
                collectionPath: 'books',
                documentsFound: 0,
                message: 'No book data found',
                databaseInfo: JSON.stringify(db),
                timestamp: new Date().toISOString()
              }
            }
          };
          loading.value = false;
          return;
        }
        
        // Process query results
        const booksArray = [];
        querySnapshot.forEach((doc) => {
          console.log('Document ID:', doc.id);
          console.log('Document data:', doc.data());
          booksArray.push({ id: doc.id, ...doc.data() });
        });
        
        console.log('Processed books array:', booksArray);
        books.value = booksArray;
        
        // Format API response
        apiResponse.value = {
          success: true,
          data: {
            totalBooks: books.value.length,
            books: books.value.map(book => ({
              id: book.id,
              isbn: book.isbn || 'Unknown ISBN',
              name: book.name || 'Unknown book name',
              timestamp: new Date().toISOString()
            })),
            debug: {
              collectionPath: 'books',
              documentsFound: querySnapshot.size,
              timestamp: new Date().toISOString()
            },
            source: 'Firebase Firestore'
          }
        };
      } catch (err) {
        console.error('Error fetching books:', err);
        console.error('Error details:', JSON.stringify(err, Object.getOwnPropertyNames(err)));
        error.value = `Error loading books data: ${err.message}`;
        apiResponse.value = {
          success: false,
          error: err.message,
          errorStack: err.stack,
          timestamp: new Date().toISOString()
        };
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchAllBooks();
    });

    return {
      books,
      loading,
      error,
      apiResponse,
      fetchAllBooks,
      useFirebase,
      toggleDataSource,
      showAddForm,
      newBook,
      addTestBook,
      addingBook,
      addBookResult
    };
  }
};
</script>

<style scoped>
.api-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.controls {
  margin-bottom: 20px;
  text-align: center;
}

.refresh-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.refresh-btn:hover {
  background-color: #2980b9;
}

.toggle-btn {
  background-color: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
  transition: background-color 0.3s;
}

.toggle-btn:hover {
  background-color: #219653;
}

.data-source-info {
  background-color: #f1f8ff;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
  border-left: 4px solid #3498db;
}

.add-btn {
  background-color: #9b59b6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
  transition: background-color 0.3s;
}

.add-btn:hover {
  background-color: #8e44ad;
}

.add-form {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
  margin: 20px 0;
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.submit-btn {
  background-color: #9b59b6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #8e44ad;
}

.submit-btn:disabled {
  background-color: #d2b4de;
  cursor: not-allowed;
}

.add-result {
  margin-top: 15px;
  padding: 10px;
  border-radius: 4px;
}

.add-result.success {
  background-color: #d5f5e3;
  color: #27ae60;
  border-left: 4px solid #27ae60;
}

.add-result.error {
  background-color: #fadbd8;
  color: #e74c3c;
  border-left: 4px solid #e74c3c;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 40px 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(52, 152, 219, 0.2);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading p {
  margin-top: 10px;
  color: #3498db;
  font-size: 18px;
}

.error {
  background-color: #fadbd8;
  color: #e74c3c;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  text-align: center;
  font-weight: bold;
}

.api-response {
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  overflow: auto;
  max-height: 600px;
}

pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
}
</style>