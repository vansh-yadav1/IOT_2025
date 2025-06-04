from fastapi import APIRouter, Depends, HTTPException, Query, Body
from ..utils.supabase_client import get_supabase_client
from uuid import uuid4
from pydantic import BaseModel
from src.utils.supabase_client import supabase
from src.utils.auth import get_current_user_id

router = APIRouter(prefix="/messaging", tags=["messaging"])

class MessageIn(BaseModel):
    doctorId: int
    message: str

class MessageBody(BaseModel):
    conversation_id: str
    content: str

@router.get("/conversations")
def list_conversations():
    supabase = get_supabase_client()
    # user_id = current_user["id"] if isinstance(current_user, dict) else current_user.id
    # Get conversations where user is patient or doctor
    # You may need to adjust this logic if you want to filter by user
    resp = supabase.table("conversations").select("*").execute()
    return resp.data

@router.post("/conversations")
def create_conversation(patient_id: str, doctor_id: str):
    supabase = get_supabase_client()
    # Check if conversation exists
    resp = supabase.table("conversations").select("*") \
        .eq("patient_id", patient_id).eq("doctor_id", doctor_id).single().execute()
    if resp.data:
        return resp.data
    # Create new conversation
    new_conv = {
        "id": str(uuid4()),
        "patient_id": patient_id,
        "doctor_id": doctor_id
    }
    supabase.table("conversations").insert(new_conv).execute()
    return new_conv

@router.get("/messages")
def list_messages(conversation_id: str = Query(...)):
    supabase = get_supabase_client()
    # Check user is part of conversation (removed user check)
    conv = supabase.table("conversations").select("*").eq("id", conversation_id).single().execute().data
    # user_id = current_user["id"] if isinstance(current_user, dict) else current_user.id
    # if not conv or (user_id not in [conv["patient_id"], conv["doctor_id"]]):
    #     raise HTTPException(status_code=403, detail="Not authorized")
    resp = supabase.table("messages").select("*").eq("conversation_id", conversation_id).order("sent_at").execute()
    return resp.data

@router.post("/messages")
def send_message(body: MessageBody):
    try:
        supabase = get_supabase_client()
        conv = supabase.table("conversations").select("*").eq("id", body.conversation_id).single().execute().data
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        msg = {
            "id": str(uuid4()),
            "conversation_id": body.conversation_id,
            "content": body.content
        }
        result = supabase.table("messages").insert(msg).execute()
        if hasattr(result, 'error') and result.error:
            raise HTTPException(status_code=400, detail=result.error.message)
        return msg
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def send_message_new(msg: MessageIn, user_id: str = Depends(get_current_user_id)):
    # Save message to supabase
    result = supabase.table('messages').insert({
        'user_id': user_id,
        'doctor_id': msg.doctorId,
        'message': msg.message
    }).execute()
    if result.error:
        raise HTTPException(status_code=400, detail=result.error.message)
    return {"message": "Message sent"}

@router.get("/")
async def get_messages(user_id: str = Depends(get_current_user_id)):
    result = supabase.table('messages').select('*').eq('user_id', user_id).order('id', desc=True).execute()
    if result.error:
        raise HTTPException(status_code=400, detail=result.error.message)
    return result.data 