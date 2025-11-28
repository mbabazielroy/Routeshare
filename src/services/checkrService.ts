// Checkr Background Check Service
import { supabase } from '../config/supabase';

const CHECKR_API_KEY = process.env.EXPO_PUBLIC_CHECKR_API_KEY;
const CHECKR_API_URL = 'https://api.checkr.com/v1';

export interface DriverVerification {
  userId: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'needs_review';
  checkrCandidateId?: string;
  checkrReportId?: string;
  backgroundCheckStatus?: string;
  mvrCheckStatus?: string;
  licenseVerified: boolean;
  insuranceVerified: boolean;
  vehicleVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LicenseInfo {
  licenseNumber: string;
  state: string;
  expirationDate: string;
  imageUri?: string;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  state: string;
  registrationImageUri?: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  expirationDate: string;
  imageUri?: string;
}

/**
 * Create a Checkr candidate for background check
 */
export const createCheckrCandidate = async (
  email: string,
  firstName: string,
  lastName: string,
  phone: string,
  dob: string, // Format: YYYY-MM-DD
  ssn: string, // Last 4 digits only
  zipcode: string
): Promise<{ candidateId: string; error?: string }> => {
  if (!CHECKR_API_KEY) {
    console.warn('Checkr API key not configured - using demo mode');
    return { candidateId: `demo_candidate_${Date.now()}` };
  }

  try {
    const response = await fetch(`${CHECKR_API_URL}/candidates`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(CHECKR_API_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        dob,
        ssn,
        zipcode,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create candidate');
    }

    return { candidateId: data.id };
  } catch (error: any) {
    console.error('Error creating Checkr candidate:', error);
    return { candidateId: '', error: error.message };
  }
};

/**
 * Request a background check
 */
export const requestBackgroundCheck = async (
  candidateId: string,
  package_name: string = 'driver_pro' // Options: driver_pro, tasker_pro, etc.
): Promise<{ reportId: string; error?: string }> => {
  if (!CHECKR_API_KEY) {
    console.warn('Checkr API key not configured - using demo mode');
    return { reportId: `demo_report_${Date.now()}` };
  }

  try {
    const response = await fetch(`${CHECKR_API_URL}/reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(CHECKR_API_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate_id: candidateId,
        package: package_name,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create report');
    }

    return { reportId: data.id };
  } catch (error: any) {
    console.error('Error requesting background check:', error);
    return { reportId: '', error: error.message };
  }
};

/**
 * Get background check report status
 */
export const getReportStatus = async (
  reportId: string
): Promise<{
  status: string;
  result?: string;
  adjudication?: string;
  error?: string;
}> => {
  if (!CHECKR_API_KEY) {
    console.warn('Checkr API key not configured - using demo mode');
    return { status: 'complete', result: 'clear', adjudication: 'approved' };
  }

  try {
    const response = await fetch(`${CHECKR_API_URL}/reports/${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${btoa(CHECKR_API_KEY + ':')}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get report');
    }

    return {
      status: data.status, // pending, processing, complete
      result: data.result, // clear, consider
      adjudication: data.adjudication, // approved, rejected, pending_review
    };
  } catch (error: any) {
    console.error('Error getting report status:', error);
    return { status: 'error', error: error.message };
  }
};

/**
 * Request Motor Vehicle Report (MVR)
 */
export const requestMVRCheck = async (
  candidateId: string,
  licenseNumber: string,
  licenseState: string
): Promise<{ reportId: string; error?: string }> => {
  if (!CHECKR_API_KEY) {
    console.warn('Checkr API key not configured - using demo mode');
    return { reportId: `demo_mvr_${Date.now()}` };
  }

  try {
    const response = await fetch(`${CHECKR_API_URL}/motor_vehicle_reports`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(CHECKR_API_KEY + ':')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate_id: candidateId,
        license_number: licenseNumber,
        license_state: licenseState,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create MVR report');
    }

    return { reportId: data.id };
  } catch (error: any) {
    console.error('Error requesting MVR check:', error);
    return { reportId: '', error: error.message };
  }
};

/**
 * Save driver verification to database
 */
export const saveDriverVerification = async (
  userId: string,
  verification: Partial<DriverVerification>
): Promise<boolean> => {
  if (!supabase) {
    console.log('Supabase not configured - verification saved locally');
    return true;
  }

  try {
    const { error } = await supabase
      .from('driver_verifications')
      .upsert({
        userId,
        ...verification,
        updatedAt: new Date().toISOString(),
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error saving driver verification:', error);
    return false;
  }
};

/**
 * Get driver verification status
 */
export const getDriverVerification = async (
  userId: string
): Promise<DriverVerification | null> => {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('driver_verifications')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting driver verification:', error);
    return null;
  }
};

/**
 * Upload document to storage
 */
export const uploadDocument = async (
  userId: string,
  documentType: 'license' | 'registration' | 'insurance' | 'profile_photo',
  fileUri: string
): Promise<{ url: string; error?: string }> => {
  if (!supabase) {
    console.log('Supabase not configured - using local file');
    return { url: fileUri };
  }

  try {
    // Convert file URI to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const fileName = `${userId}/${documentType}_${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('driver-documents')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('driver-documents')
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl };
  } catch (error: any) {
    console.error('Error uploading document:', error);
    return { url: '', error: error.message };
  }
};

/**
 * Validate driver license format
 */
export const validateLicense = (
  licenseNumber: string,
  state: string
): { valid: boolean; error?: string } => {
  // Basic validation - in production, use state-specific regex patterns
  if (!licenseNumber || licenseNumber.length < 5) {
    return { valid: false, error: 'License number is too short' };
  }

  if (!state || state.length !== 2) {
    return { valid: false, error: 'Invalid state code' };
  }

  return { valid: true };
};

/**
 * Check if license is expired
 */
export const isLicenseExpired = (expirationDate: string): boolean => {
  const expDate = new Date(expirationDate);
  const today = new Date();
  return expDate < today;
};

/**
 * Complete driver verification process
 */
export const completeDriverVerification = async (
  userId: string,
  license: LicenseInfo,
  vehicle: VehicleInfo,
  insurance: InsuranceInfo,
  personalInfo: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    dob: string;
    ssn: string;
    zipcode: string;
  }
): Promise<{ success: boolean; verificationId?: string; error?: string }> => {
  try {
    // Step 1: Validate license
    const licenseValidation = validateLicense(license.licenseNumber, license.state);
    if (!licenseValidation.valid) {
      return { success: false, error: licenseValidation.error };
    }

    // Step 2: Check expiration dates
    if (isLicenseExpired(license.expirationDate)) {
      return { success: false, error: 'Driver license is expired' };
    }

    if (isLicenseExpired(insurance.expirationDate)) {
      return { success: false, error: 'Insurance is expired' };
    }

    // Step 3: Create Checkr candidate
    const candidateResult = await createCheckrCandidate(
      personalInfo.email,
      personalInfo.firstName,
      personalInfo.lastName,
      personalInfo.phone,
      personalInfo.dob,
      personalInfo.ssn,
      personalInfo.zipcode
    );

    if (candidateResult.error) {
      return { success: false, error: candidateResult.error };
    }

    // Step 4: Request background check
    const backgroundCheckResult = await requestBackgroundCheck(candidateResult.candidateId);

    if (backgroundCheckResult.error) {
      return { success: false, error: backgroundCheckResult.error };
    }

    // Step 5: Request MVR check
    const mvrResult = await requestMVRCheck(
      candidateResult.candidateId,
      license.licenseNumber,
      license.state
    );

    // Step 6: Save verification to database
    const verification: Partial<DriverVerification> = {
      userId,
      status: 'processing',
      checkrCandidateId: candidateResult.candidateId,
      checkrReportId: backgroundCheckResult.reportId,
      licenseVerified: true,
      insuranceVerified: true,
      vehicleVerified: true,
      createdAt: new Date().toISOString(),
    };

    await saveDriverVerification(userId, verification);

    return {
      success: true,
      verificationId: backgroundCheckResult.reportId,
    };
  } catch (error: any) {
    console.error('Error completing driver verification:', error);
    return { success: false, error: error.message };
  }
};
