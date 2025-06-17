import * as functions from "firebase-functions";

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_GROUP_ID = process.env.MAILERLITE_GROUP_ID;
const MAILERLITE_API_URL = "https://api.mailerlite.com/api/v2";

/**
 * Adds a new subscriber to MailerLite or updates an existing one.
 * @param {string} email The subscriber's email address.
 * @param {string | null} name The subscriber's name (optional).
 */
export const addOrUpdateSubscriber = async (
  email: string,
  name: string | null
) => {
  if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_ID) {
    functions.logger.error(
      "MailerLite API Key or Group ID is not configured."
    );
    return;
  }

  const subscriberData: { email: string; name?: string; fields?: any } = {
    email,
  };

  if (name) {
    subscriberData.name = name;
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
        body: JSON.stringify(subscriberData),
      }
    );

    if (response.ok) {
      const responseData = await response.json();
      functions.logger.info(
        `Successfully added/updated subscriber ${email} in MailerLite.`,
        responseData
      );
    } else {
      const errorData = await response.json();
      functions.logger.error(
        `Failed to add/update subscriber in MailerLite. Status: ${response.status}`,
        errorData
      );
    }
  } catch (error) {
    functions.logger.error(
      "An unexpected error occurred while contacting MailerLite.",
      error
    );
  }
};