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
 * @param name The subscriber's full name.
 */
export const addOrUpdateSubscriber = async (
  email: string,
  name: string | null
): Promise<void> => {
  if (!MAILERLITE_API_KEY || !MAILERLITE_GROUP_ID) {
    console.error("MailerLite API Key or Group ID is not configured.");
    return;
  }

  const payload: SubscriberPayload = {
    email: email,
    resubscribe: true,
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

    if (!response.ok) {
        const errorData = await response.json();
        console.error(`MailerLite API error for ${email}:`, errorData);
    } else {
        console.log(`Successfully synced ${email} to MailerLite.`);
    }
  } catch (error) {
    console.error(`Failed to sync ${email} due to an unexpected error.`, error);
  }
};