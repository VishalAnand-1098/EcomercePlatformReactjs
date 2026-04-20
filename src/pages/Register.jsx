import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">Join us today</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;
