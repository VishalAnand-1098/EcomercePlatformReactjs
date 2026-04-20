# ShopHub - Full-Stack eCommerce Application

A modern, full-stack eCommerce web application built with React (Vite), Tailwind CSS, and Supabase PostgreSQL with custom authentication.

## 🚀 Features

### User Features
- ✅ User registration & login (custom authentication with bcrypt + JWT)
- ✅ Browse products with filters & search
- ✅ View detailed product information
- ✅ Add products to cart
- ✅ Update cart quantities
- ✅ Secure checkout process
- ✅ View order history
- ✅ Contact form
- ✅ Fully responsive design

### Admin Features
- ✅ Admin dashboard with statistics
- ✅ Add/Edit/Delete products
- ✅ Upload product images
- ✅ Manage product categories
- ✅ View all orders
- ✅ Update order status
- ✅ View customer messages

### Technical Features
- ✅ Custom authentication (NO Supabase Auth - using bcrypt + JWT)
- ✅ Protected routes with role-based access control
- ✅ Image upload to Supabase Storage
- ✅ Real-time data fetching
- ✅ Form validation
- ✅ Error handling & toast notifications
- ✅ Loading states
- ✅ Pagination
- ✅ Clean architecture & scalable structure

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Context API
- **Backend**: Supabase PostgreSQL (Database + Storage only)
- **Authentication**: Custom (bcrypt + JWT - NO Supabase Auth)
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: React Icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd ecommerce-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Create a new project on [Supabase](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy the contents of `database-setup.sql` and run it
4. Go to **Storage** and create a bucket named `product-images`
   - Set it to **Public** for image access
5. Get your Supabase credentials:
   - Project URL
   - Anon/Public Key

### 4. Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_JWT_SECRET=your_super_secret_jwt_key_change_this
```

**Important**: Never commit your `.env` file to version control!

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components (Header, Footer, Sidebar)
│   ├── product/           # Product-related components
│   ├── cart/              # Cart components
│   ├── admin/             # Admin panel components
│   └── common/            # Reusable components (Button, Input, Modal, etc.)
├── pages/                 # Page components
│   ├── admin/             # Admin pages
│   ├── Home.jsx
│   ├── Products.jsx
│   ├── Cart.jsx
│   └── ...
├── context/               # React Context for state management
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── services/              # API service functions
│   ├── supabaseClient.js
│   ├── authService.js
│   ├── productService.js
│   └── ...
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
├── routes/                # Route configuration
└── App.jsx               # Main app component
```

## 🔐 Authentication Flow

This application uses **custom authentication** (NOT Supabase Auth):

1. **Registration**:
   - User submits name, email, password
   - Password is hashed using bcrypt (10 salt rounds)
   - User data saved to `ecommerce_users` table
   - JWT token generated and returned

2. **Login**:
   - User submits email, password
   - Password verified against hashed password in database
   - JWT token generated and stored in localStorage
   - User redirected based on role (admin → admin panel, user → home)

3. **Protected Routes**:
   - Token verified on each protected route access
   - Role-based access control for admin routes

## 🗄️ Database Schema

The application uses 7 main tables (all prefixed with `ecommerce_`):

1. **ecommerce_users** - User accounts
2. **ecommerce_categories** - Product categories
3. **ecommerce_products** - Product catalog
4. **ecommerce_cart** - Shopping cart items
5. **ecommerce_orders** - Order records
6. **ecommerce_order_items** - Individual order items
7. **ecommerce_contact** - Contact form submissions

See `database-setup.sql` for complete schema.

## 👤 Creating an Admin User

1. Register a new user through the registration page
2. Go to your Supabase dashboard
3. Navigate to **Table Editor** → `ecommerce_users`
4. Find your user and change the `role` field from `user` to `admin`
5. Log out and log back in
6. You'll now have access to the admin panel

## 📝 Available Scripts

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🚀 Deployment

### Deploying to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_JWT_SECRET`
5. Deploy!

### Deploying to Netlify

1. Build the project: `npm run build`
2. Go to [Netlify](https://netlify.com)
3. Drag and drop the `dist` folder
4. Add environment variables in site settings
5. Redeploy with environment variables

## 🔒 Security Considerations

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens with expiration (7 days)
- ✅ Input validation on forms
- ✅ SQL injection prevention (Supabase parameterized queries)
- ✅ XSS protection through React's built-in escaping
- ✅ Row Level Security (RLS) policies on Supabase tables
- ⚠️ **Change JWT secret in production**
- ⚠️ **Never commit .env file**

## 🎨 Customization

### Change Colors

Edit the Tailwind colors in your components. Main colors used:
- Primary: `blue-600`
- Success: `green-600`
- Danger: `red-600`
- Warning: `orange-600`

### Add More Features

The architecture is designed to be easily extensible:
- Add new services in `src/services/`
- Create new components in appropriate folders
- Add routes in `src/routes/AppRoutes.jsx`
- Update database schema as needed

## 🐛 Troubleshooting

### Database Connection Issues
- Verify your Supabase URL and anon key in `.env`
- Check if RLS policies are properly set up
- Ensure tables were created successfully

### Authentication Errors
- Clear localStorage and try again
- Verify JWT secret is set in `.env`
- Check if user exists in database

### Image Upload Issues
- Verify `product-images` bucket exists in Supabase Storage
- Check bucket is set to public
- Ensure storage policies allow uploads

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 💬 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using React, Tailwind CSS, and Supabase**

