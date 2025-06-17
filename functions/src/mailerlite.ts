import * as functions from "firebase-functions";

// Get MailerLite credentials from environment variables
const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;
const MAILERLITE_API_URL = "https://api.mailerlite.com/api/v2";

interface SubscriberPayload {
  email: string;
  name?: string;
  resubscribe?: boolean;
}

/**
 * Adds or updates a subscriber in a MailerLite group.
 * @param email The subscriber's email address.
 * @param name The subscriber's full name. Can be null.
 */
export const addOrUpdateSubscriber = async (
  email: string,
  name: string | null
): Promise<void> => {
  if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_ID) {
    functions.logger.error(
      "MailerLite API Key or Group ID is not configured."
    );
    // In a real app, you might throw an error or handle this differently
    return;
  }

  const payload: SubscriberPayload = {
    email: email,
    resubscribe: true, // This ensures that if a user unsubscribes and signs up again, they are re-added.
  };

  if (name) {
    payload.name = name;
  }

  try {
    const response = await fetch(
      `${MAILERLITE_API_URL}/groups/${MAILERLITE_GROUP_ID}/subscribers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MailerLite-ApiKey": MAILERLITE_API_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      functions.logger.info(`Successfully synced subscriber ${email} to MailerLite.`);
    } else {
      // Try to parse the error response from MailerLite for better logging
      const errorResponse = await response.json();
      functions.logger.error(
        `Failed to sync subscriber ${email}. MailerLite responded with status ${response.status}:`,
        errorResponse
      );
    }
  } catch (error) {
    functions.logger.error(
      "An unexpected error occurred while contacting MailerLite.",
      error
    );
  }
};