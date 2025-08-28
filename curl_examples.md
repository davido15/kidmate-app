# KidMate Status Update Examples

## Current Journey Flow:
1. **Started** (pending) → **Departed** (Parent)
2. **Departed** → **Picked Up** (School Admin)
3. **Picked Up** → **Arrived** (Parent)
4. **Arrived** → **Completed** (Parent)

## Important Note:
You cannot go directly from "departed" to "arrived". The correct flow is:
**departed** → **picked** → **arrived**

## Curl Examples:

### 1. Update Status from Departed to Picked (School Admin)
```bash
curl -X POST https://8e05f2e522d9.ngrok-free.app/update_status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pickup_id": "YOUR_PICKUP_ID",
    "parent_id": "YOUR_PARENT_ID",
    "child_id": "YOUR_CHILD_ID",
    "pickup_person_id": "YOUR_PICKUP_PERSON_ID",
    "status": "picked"
  }'
```

### 2. Update Status from Picked to Arrived (Parent)
```bash
curl -X POST https://8e05f2e522d9.ngrok-free.app/update_status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pickup_id": "YOUR_PICKUP_ID",
    "parent_id": "YOUR_PARENT_ID",
    "child_id": "YOUR_CHILD_ID",
    "pickup_person_id": "YOUR_PICKUP_PERSON_ID",
    "status": "arrived"
  }'
```

### 3. Update Status from Arrived to Completed (Parent)
```bash
curl -X POST https://8e05f2e522d9.ngrok-free.app/update_status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pickup_id": "YOUR_PICKUP_ID",
    "parent_id": "YOUR_PARENT_ID",
    "child_id": "YOUR_CHILD_ID",
    "pickup_person_id": "YOUR_PICKUP_PERSON_ID",
    "status": "completed"
  }'
```

### 4. Get Current Status
```bash
curl -X GET "https://8e05f2e522d9.ngrok-free.app/get_status?pickup_id=YOUR_PICKUP_ID"
```

## Postman Collection:
Import the `postman_status_update.json` file into Postman for a complete collection of all status update requests.

## Required Fields:
- `pickup_id`: The unique journey identifier
- `parent_id`: The parent's ID
- `child_id`: The child's ID  
- `pickup_person_id`: The pickup person's ID
- `status`: The new status to set

## Error Responses:
- **400**: Invalid status transition (e.g., trying to go from "departed" directly to "arrived")
- **400**: Missing required fields
- **404**: Journey not found
- **401**: Unauthorized (invalid/missing token) 