interface SuccessResponse<T> {
  data: T; // Data is present in success cases
  error?: never; // Error must be absent
  message?: string;

}

interface ErrorResponse {
  data?: never; // Data must be absent
  error: string; // Error message in error cases
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;