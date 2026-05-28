UPDATE `Message`
SET conversation_id = CONCAT(
  LEAST(sender_id, receiver_id),
  '_',
  GREATEST(sender_id, receiver_id)
)
WHERE conversation_id = '' OR conversation_id IS NULL;
