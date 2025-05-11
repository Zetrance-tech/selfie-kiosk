import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import VirtualKeyboard from "../components/VirtualKeyboard";

interface FormData {
  name: string;
  phone: string;
  email: string;
}

const FormPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>();
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [keyboardPosition, setKeyboardPosition] = useState({ 
    x: window.innerWidth / 2 - 200, 
    y: window.innerHeight - 300 
  });
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const formRef = useRef<HTMLFormElement>(null);
  const keyboardContainerRef = useRef<HTMLDivElement>(null);
  const inputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  const registerInputRef = (name: string) => (element: HTMLInputElement | null) => {
    inputRefs.current[name] = element;
  };

  // const onSubmit = (data: FormData) => {
  //   localStorage.setItem("userInfo", JSON.stringify(data));
  //   navigate("/photo");
  // };


  // new change
  const onSubmit = (data: FormData) => {
    localStorage.setItem("userInfo", JSON.stringify(data));
    navigate("/download/:id");
  };

  const handleKeyPress = (key: string) => {
    if (focusedInput) {
      const currentValue = getValues(focusedInput as keyof FormData) || '';
      setValue(focusedInput as keyof FormData, currentValue + key, { 
        shouldDirty: true, 
        shouldValidate: true 
      });
      // Update the input value directly
      if (inputRefs.current[focusedInput]) {
        inputRefs.current[focusedInput]!.value = currentValue + key;
      }
    }
  };

  const handleBackspace = () => {
    if (focusedInput) {
      const currentValue = getValues(focusedInput as keyof FormData) || '';
      const newValue = currentValue.slice(0, -1);
      setValue(focusedInput as keyof FormData, newValue, { 
        shouldDirty: true, 
        shouldValidate: true 
      });
      if (inputRefs.current[focusedInput]) {
        inputRefs.current[focusedInput]!.value = newValue;
      }
    }
  };

  const handleFocus = (inputName: string) => {
    setFocusedInput(inputName);
    setKeyboardVisible(true);
    const inputElement = inputRefs.current[inputName];
    if (inputElement && keyboardContainerRef.current) {
      const inputRect = inputElement.getBoundingClientRect();
      const keyboardHeight = keyboardContainerRef.current.offsetHeight;
      
      setKeyboardPosition({
        x: window.innerWidth / 2 - keyboardContainerRef.current.offsetWidth / 2,
        y: Math.min(inputRect.top - keyboardHeight - 10, window.innerHeight - keyboardHeight - 20)
      });
    }
  };

  // Prevent default keyboard from appearing
  const preventDefaultKeyboard = (e: React.KeyboardEvent | React.TouchEvent) => {
    e.preventDefault();
  };

  const handleInputTouch = (inputName: string) => (e: React.TouchEvent) => {
    e.preventDefault();
    const input = inputRefs.current[inputName];
    if (input) {
      input.focus();
      handleFocus(inputName);
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    const relatedTarget = e.relatedTarget as Node;
    if (relatedTarget instanceof HTMLElement && 
        (keyboardContainerRef.current?.contains(relatedTarget) ||
         relatedTarget.tagName === 'INPUT')) {
      return;
    }
    setKeyboardVisible(false);
    setFocusedInput(null);
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (keyboardContainerRef.current) {
      setDragOffset({
        x: clientX - keyboardPosition.x,
        y: clientY - keyboardPosition.y
      });
      setIsDragging(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    handleDragStart(touch.clientX, touch.clientY);
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (isDragging) {
      setKeyboardPosition({
        x: clientX - dragOffset.x,
        y: clientY - dragOffset.y
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const touch = e.touches[0];
      handleDragMove(touch.clientX, touch.clientY);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging, dragOffset]);

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const options = { passive: false };
    const inputs = formRef.current?.querySelectorAll('input');
    const handleInputTouch = (e: TouchEvent) => {
      e.preventDefault();
      const target = e.target as HTMLInputElement;
      const inputName = target.name as keyof FormData;
      if (inputName && inputRefs.current[inputName]) {
        inputRefs.current[inputName]?.focus();
        handleFocus(inputName);
      }
    };

    inputs?.forEach(input => {
      input.addEventListener('touchstart', handleInputTouch, options);
      // Prevent default keyboard
      input.addEventListener('keydown', (e) => e.preventDefault());
    });

    return () => {
      inputs?.forEach(input => {
        input.removeEventListener('touchstart', handleInputTouch);
        input.removeEventListener('keydown', (e) => e.preventDefault());
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url('/images/background.jpg')` }}>
      <div className="relative z-10 w-full max-w-2xl p-6 bg-gray-900 bg-opacity-70 backdrop-blur-lg rounded-xl shadow-xl">
        <Link to="/" className="flex items-center justify-center gap-2 py-8">
          <img src="/images/logo.png" alt="Logo" className="w-auto h-auto" />
        </Link>
        <h2 className="text-4xl font-serif text-amber-300 text-center mb-8">
          Your Information
        </h2>

        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <input
              {...register("name", { required: "Name is required" })}
              name="name"
              ref={registerInputRef("name")}
              placeholder="Full Name"
              className="w-full px-6 py-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-2xl"
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              onTouchStart={handleInputTouch('name')}
              onKeyDown={preventDefaultKeyboard}
              readOnly // Prevents native keyboard
              autoComplete="off"
            />
            {errors.name && (
              <p className="mt-1 text-red-400 text-lg">{errors.name.message}</p>
            )}
          </div>

          <div>
            <input
              {...register("phone", {
                required: "Phone number is required",
                validate: {
                  validLength: (value) => {
                    const digitsOnly = value.replace(/\D/g, "");
                    return (
                      digitsOnly.length === 10 ||
                      "Phone number must be 10 digits"
                    );
                  },
                  validFormat: (value) => {
                    const cleaned = value.replace(/\D/g, "");
                    return (
                      /^\d{10}$/.test(cleaned) || "Invalid phone number format"
                    );
                  },
                },
              })}
              name="phone"
              ref={registerInputRef("phone")}
              placeholder="Phone Number"
              className="w-full px-6 py-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-2xl"
              onFocus={() => handleFocus('phone')}
              onBlur={handleBlur}
              onTouchStart={handleInputTouch('phone')}
              onKeyDown={preventDefaultKeyboard}
              readOnly // Prevents native keyboard
              autoComplete="off"
            />
            {errors.phone && (
              <p className="mt-1 text-red-400 text-lg">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              name="email"
              ref={registerInputRef("email")}
              placeholder="Email Address"
              className="w-full px-6 py-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-2xl"
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              onTouchStart={handleInputTouch('email')}
              onKeyDown={preventDefaultKeyboard}
              readOnly // Prevents native keyboard
              autoComplete="off"
            />
            {errors.email && (
              <p className="mt-1 text-red-400 text-lg">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* <button
              onClick={() => navigate('/')}
              className="flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
            >
              Home Page
            </button> */}

          {/* <button
            type="submit"
            className="w-full px-12 py-6 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-3xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
          >
            Download Photo
          </button> */}
          <button
            onClick={() => navigate('/download')}
            className="w-full px-12 py-6 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-3xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
          >
            Download Photo
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full px-12 py-6 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-3xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
          >
            Home
          </button>
        </form>

        {keyboardVisible && (
          <div
            ref={keyboardContainerRef}
            style={{
              position: 'fixed',
              left: `${keyboardPosition.x}px`,
              top: `${keyboardPosition.y}px`,
              zIndex: 1000,
              touchAction: 'none',
            }}
          >
            <div 
              className="bg-gray-800 p-2 rounded-t-lg text-white text-center cursor-move"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
              style={{ userSelect: 'none' }}
            >
              Drag Keyboard
            </div>
            <VirtualKeyboard
              onKeyPress={handleKeyPress}
              onBackspace={handleBackspace}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormPage;
