-- deleteCard is a soft delete (UPDATE card SET deleted = 1), so log_card_update was writing an
-- activity row with action='UPDATE' for it. /measure reads action='UPDATE' as "reviewed", so
-- every delete inflated the streak and painted the heatmap. log_card_delete never fired at all,
-- because nothing in the app hard-deletes a card.
--
-- Split the two apart: a real edit/review still logs 'UPDATE', and flipping the deleted flag
-- logs 'DELETE' instead, which keeps the audit trail without counting as activity.
DROP TRIGGER IF EXISTS log_card_update;
--> statement-breakpoint
CREATE TRIGGER log_card_update
    AFTER UPDATE ON card
    WHEN NEW.deleted = OLD.deleted
BEGIN
    INSERT INTO activity(id,
    action,
    card_id,
    user_id,
    created_at)
VALUES(lower(hex(randomblob(16))),
    'UPDATE',
    NEW.id,
    NEW.user_id,
    strftime('%s', 'now'));

END;
--> statement-breakpoint
CREATE TRIGGER log_card_soft_delete
    AFTER UPDATE ON card
    WHEN NEW.deleted = 1 AND OLD.deleted = 0
BEGIN
    INSERT INTO activity(id,
    action,
    card_id,
    user_id,
    created_at)
VALUES(lower(hex(randomblob(16))),
    'DELETE',
    NEW.id,
    NEW.user_id,
    strftime('%s', 'now'));

END;
