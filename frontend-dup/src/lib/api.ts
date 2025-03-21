
// Mock API functions - in a real app, these would connect to your backend server

/**
 * Validates a user's JWT token with the backend
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    // In a real app, you would make an API call to validate the token
    // For demo purposes, we'll simulate a successful validation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, tokens starting with "invalid" will fail validation
    if (token.startsWith('invalid')) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation failed', error);
    return false;
  }
};

/**
 * Authenticates a user and returns a JWT token
 */
export const loginUser = async (username: string, password: string) => {
  try {
    // In a real app, you would make an API call to authenticate
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // For demo purposes, we'll simulate a successful authentication
    if (password === 'invalidpass') {
      throw new Error('Invalid credentials');
    }
    
    return {
      user: username,
      token: `mock-jwt-token-${Math.random().toString(36).substring(2)}`,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Submits an annotation to the backend
 */
export const submitAnnotation = async (annotationData: any) => {
  try {
    // In a real app, you would make an API call to submit the annotation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a success response
    return {
      success: true,
      message: 'Annotation submitted successfully',
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Fetches annotations from the backend
 */
export const fetchAnnotations = async () => {
  try {
    // In a real app, you would make an API call to fetch annotations
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return sample data
    return [
      {
        id: '1',
        question: "Should we adjust the inotropic support for this patient?",
        context: "65-year-old male with acute myocardial infarction on inotropic support",
        categories: ["cardiovascular"],
        icuTypes: ["medical", "cardiac"]
      },
      {
        id: '2',
        question: "Is the current ventilation strategy appropriate for this ARDS patient?",
        context: "58-year-old female with COVID-19 induced ARDS on mechanical ventilation",
        categories: ["respiratory"],
        icuTypes: ["medical"]
      },
      {
        id: '3',
        question: "Should we continue renal replacement therapy for this patient?",
        context: "72-year-old male with sepsis-induced acute kidney injury on CRRT",
        categories: ["renal"],
        icuTypes: ["medical"]
      }
    ];
  } catch (error) {
    throw error;
  }
};
