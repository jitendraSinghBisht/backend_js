import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthcheck = asyncHandler(async (req, res) => {
  const { errorCheck } = req.body;
  if (errorCheck) {
    throw new ApiError(400, "Errors working properly");
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Everything OK server working properly"));
});

export { healthcheck };
