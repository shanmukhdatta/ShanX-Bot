"""
ShanXBot Backend — FastAPI + LangChain
Built by Shanmukh Datta
"""

import asyncio
import json
import logging
import os
import tempfile
import uuid
from pathlib import Path
from typing import AsyncGenerator, Dict, List, Optional

import aiofiles
from fastapi import FastAPI, File, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ShanXBot API",
    description="Multi-model agentic AI assistant backend — Built by Shanmukh Datta",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory stores
session_histories: Dict[str, List[dict]] = {}
rag_store: Dict = {}
upload_dir = Path(tempfile.mkdtemp(prefix="shanxbot_"))


# ─── Pydantic Models ────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    system_prompt: str = "You are ShanXBot, an advanced AI assistant built by Shanmukh Datta. Be helpful, precise, and insightful."
    model: str = "llama-3.3-70b-versatile"
    rag_enabled: bool = False


class SuperIntelRequest(BaseModel):
    message: str
    session_id: str = "default"
    system_prompt: str = "You are ShanXBot, an advanced AI assistant built by Shanmukh Datta."
    rag_enabled: bool = False


# ─── Helpers ────────────────────────────────────────────────────────────────

def get_api_keys(
    groq_key: Optional[str] = Header(None, alias="x-groq-key"),
    gemini_key: Optional[str] = Header(None, alias="x-gemini-key"),
    openrouter_key: Optional[str] = Header(None, alias="x-openrouter-key"),
):
    return {
        "groq": groq_key or os.getenv("GROQ_API_KEY", ""),
        "gemini": gemini_key or os.getenv("GEMINI_API_KEY", ""),
        "openrouter": openrouter_key or os.getenv("OPENROUTER_API_KEY", ""),
    }


def build_groq_llm(api_key: str, model: str = "llama-3.3-70b-versatile", streaming: bool = False):
    from langchain_groq import ChatGroq
    return ChatGroq(
        api_key=api_key,
        model=model,
        temperature=0.7,
        max_tokens=2048,
        streaming=streaming,
    )


def build_gemini_llm(api_key: str, model: str = "gemini-1.5-flash"):
    from langchain_google_genai import ChatGoogleGenerativeAI
    return ChatGoogleGenerativeAI(
        google_api_key=api_key,
        model=model,
        temperature=0.7,
        max_output_tokens=2048,
    )


def build_openrouter_llm(api_key: str, model: str = "mistralai/mistral-7b-instruct"):
    from langchain_openai import ChatOpenAI
    return ChatOpenAI(
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1",
        model=model,
        temperature=0.7,
        max_tokens=2048,
    )


def get_rag_context(session_id: str, query: str) -> str:
    """Retrieve relevant document chunks for RAG."""
    if session_id not in rag_store:
        return ""
    try:
        vectorstore = rag_store[session_id]["vectorstore"]
        docs = vectorstore.similarity_search(query, k=4)
        if not docs:
            return ""
        context = "\n\n".join(d.page_content for d in docs)
        return f"\n\n---\n📄 **Relevant Document Context:**\n{context}\n---\n"
    except Exception as e:
        logger.warning(f"RAG retrieval failed: {e}")
        return ""


def build_messages(system_prompt: str, history: List[dict], user_message: str, rag_context: str = ""):
    from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
    messages = [SystemMessage(content=system_prompt)]
    for msg in history[-10:]:  # keep last 10 for context
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))

    final_user = user_message
    if rag_context:
        final_user = f"{user_message}{rag_context}"
    messages.append(HumanMessage(content=final_user))
    return messages


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "online",
        "message": "ShanXBot API is running",
        "version": "1.0.0",
        "built_by": "Shanmukh Datta",
    }


@app.post("/chat/stream")
async def chat_stream(request: Request, body: ChatRequest):
    """Stream chat response token by token via SSE."""
    raw_headers = dict(request.headers)
    keys = {
        "groq": raw_headers.get("x-groq-key", os.getenv("GROQ_API_KEY", "")),
        "gemini": raw_headers.get("x-gemini-key", os.getenv("GEMINI_API_KEY", "")),
        "openrouter": raw_headers.get("x-openrouter-key", os.getenv("OPENROUTER_API_KEY", "")),
    }

    session_id = body.session_id
    if session_id not in session_histories:
        session_histories[session_id] = []

    rag_context = ""
    if body.rag_enabled and session_id in rag_store:
        rag_context = get_rag_context(session_id, body.message)

    messages = build_messages(body.system_prompt, session_histories[session_id], body.message, rag_context)

    async def generate() -> AsyncGenerator[str, None]:
        full_response = ""
        try:
            # Try Groq first
            if keys["groq"]:
                llm = build_groq_llm(keys["groq"], body.model, streaming=True)
                async for chunk in llm.astream(messages):
                    token = chunk.content
                    if token:
                        full_response += token
                        yield f"data: {json.dumps({'token': token})}\n\n"
                        await asyncio.sleep(0)
            elif keys["gemini"]:
                llm = build_gemini_llm(keys["gemini"])
                response = await llm.ainvoke(messages)
                text = response.content
                # Simulate streaming word by word
                words = text.split()
                for i, word in enumerate(words):
                    token = word + (" " if i < len(words) - 1 else "")
                    full_response += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
                    await asyncio.sleep(0.02)
            elif keys["openrouter"]:
                llm = build_openrouter_llm(keys["openrouter"])
                async for chunk in llm.astream(messages):
                    token = chunk.content
                    if token:
                        full_response += token
                        yield f"data: {json.dumps({'token': token})}\n\n"
                        await asyncio.sleep(0)
            else:
                # Demo mode — no keys
                demo = "I'm ShanXBot! 🤖 Please add your API keys in Settings to enable AI responses. Built by **Shanmukh Datta**."
                for word in demo.split():
                    yield f"data: {json.dumps({'token': word + ' '})}\n\n"
                    await asyncio.sleep(0.04)
                full_response = demo

        except Exception as e:
            logger.error(f"Streaming error: {e}")
            error_msg = f"Error: {str(e)}"
            yield f"data: {json.dumps({'token': error_msg})}\n\n"
            full_response = error_msg
        finally:
            # Save to history
            session_histories[session_id].append({"role": "user", "content": body.message})
            session_histories[session_id].append({"role": "assistant", "content": full_response})
            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@app.post("/chat/superintel")
async def chat_superintel(request: Request, body: SuperIntelRequest):
    """Super Intelligence: run 2 models in parallel + judge synthesis."""
    raw_headers = dict(request.headers)
    keys = {
        "groq": raw_headers.get("x-groq-key", os.getenv("GROQ_API_KEY", "")),
        "gemini": raw_headers.get("x-gemini-key", os.getenv("GEMINI_API_KEY", "")),
        "openrouter": raw_headers.get("x-openrouter-key", os.getenv("OPENROUTER_API_KEY", "")),
    }

    session_id = body.session_id
    if session_id not in session_histories:
        session_histories[session_id] = []

    rag_context = ""
    if body.rag_enabled and session_id in rag_store:
        rag_context = get_rag_context(session_id, body.message)

    messages = build_messages(body.system_prompt, session_histories[session_id], body.message, rag_context)

    async def get_response(llm):
        try:
            response = await llm.ainvoke(messages)
            return response.content
        except Exception as e:
            return f"[Model failed: {e}]"

    async def no_groq():
        return "No Groq key provided."

    async def no_backup():
        return "No backup model key provided."

    # Model 1 and 2 in parallel
    tasks = []
    if keys["groq"]:
        llm1 = build_groq_llm(keys["groq"], "llama-3.3-70b-versatile")
        tasks.append(get_response(llm1))
    else:
        tasks.append(no_groq())

    if keys["gemini"]:
        llm2 = build_gemini_llm(keys["gemini"])
        tasks.append(get_response(llm2))
    elif keys["openrouter"]:
        llm2 = build_openrouter_llm(keys["openrouter"])
        tasks.append(get_response(llm2))
    else:
        tasks.append(no_backup())

    results = await asyncio.gather(*tasks, return_exceptions=True)
    resp1 = str(results[0]) if not isinstance(results[0], Exception) else f"Error: {results[0]}"
    resp2 = str(results[1]) if not isinstance(results[1], Exception) else f"Error: {results[1]}"

    # Judge synthesis
    judge_prompt = f"""You are a synthesis judge. Two AI models have answered the same question. 
Your task: synthesize the BEST possible answer by combining the strongest elements from both responses.

**Original Question:** {body.message}

**Model 1 Response:**
{resp1}

**Model 2 Response:**
{resp2}

Provide a comprehensive, well-structured synthesized answer. Do not mention that you are synthesizing — just provide the final best answer directly."""

    from langchain_core.messages import HumanMessage
    judge_msgs = [HumanMessage(content=judge_prompt)]

    try:
        if keys["groq"]:
            judge_llm = build_groq_llm(keys["groq"], "llama-3.3-70b-versatile")
        elif keys["gemini"]:
            judge_llm = build_gemini_llm(keys["gemini"])
        else:
            judge_llm = None

        if judge_llm:
            judge_response = await judge_llm.ainvoke(judge_msgs)
            final = judge_response.content
        else:
            final = resp1 or resp2 or "No model responses available."
    except Exception as e:
        final = resp1 or f"Judge synthesis failed: {e}"

    # Save to history
    session_histories[session_id].append({"role": "user", "content": body.message})
    session_histories[session_id].append({"role": "assistant", "content": final})

    return {
        "model1_response": resp1,
        "model2_response": resp2,
        "final_response": final,
        "status": "success",
    }


@app.get("/chat/history")
async def chat_history(session_id: str = "default"):
    return {"session_id": session_id, "messages": session_histories.get(session_id, [])}


@app.delete("/chat/clear")
async def chat_clear(session_id: str = "default"):
    session_histories.pop(session_id, None)
    return {"status": "cleared", "session_id": session_id}


@app.post("/rag/upload")
async def rag_upload(request: Request, file: UploadFile = File(...)):
    """Upload and index a document for RAG."""
    raw_headers = dict(request.headers)
    session_id = raw_headers.get("x-session-id", "default")

    filename = file.filename or "document"
    suffix = Path(filename).suffix.lower()

    # Save file
    tmp_path = upload_dir / f"{uuid.uuid4()}{suffix}"
    content = await file.read()
    async with aiofiles.open(tmp_path, "wb") as f:
        await f.write(content)

    try:
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        from langchain_community.vectorstores import FAISS
        from langchain_community.embeddings import FakeEmbeddings

        # Load document
        docs = []
        if suffix == ".pdf":
            from langchain_community.document_loaders import PyPDFLoader
            loader = PyPDFLoader(str(tmp_path))
            docs = loader.load()
        elif suffix == ".docx":
            from langchain_community.document_loaders import Docx2txtLoader
            loader = Docx2txtLoader(str(tmp_path))
            docs = loader.load()
        elif suffix in [".txt", ".md"]:
            from langchain_community.document_loaders import TextLoader
            loader = TextLoader(str(tmp_path), encoding="utf-8")
            docs = loader.load()
        elif suffix == ".csv":
            from langchain_community.document_loaders import CSVLoader
            loader = CSVLoader(str(tmp_path))
            docs = loader.load()
        else:
            # Fallback: read as text
            async with aiofiles.open(tmp_path, "r", encoding="utf-8", errors="ignore") as f:
                text = await f.read()
            from langchain_core.documents import Document
            docs = [Document(page_content=text, metadata={"source": filename})]

        if not docs:
            raise ValueError("No content extracted from document")

        # Split
        splitter = RecursiveCharacterTextSplitter(chunk_size=800, chunk_overlap=100)
        chunks = splitter.split_documents(docs)

        # Create vectorstore with fake embeddings (no API key needed for demo)
        # In production: replace with real embeddings
        try:
            embeddings = FakeEmbeddings(size=768)
            vectorstore = FAISS.from_documents(chunks, embeddings)
            rag_store[session_id] = {
                "vectorstore": vectorstore,
                "filename": filename,
                "chunk_count": len(chunks),
            }
        except Exception as e:
            logger.warning(f"FAISS failed, storing text directly: {e}")
            # Fallback: store raw text
            rag_store[session_id] = {
                "vectorstore": None,
                "raw_text": "\n".join(d.page_content for d in chunks[:20]),
                "filename": filename,
                "chunk_count": len(chunks),
            }

        return {
            "status": "success",
            "filename": filename,
            "chunk_count": len(chunks),
            "message": f"Document '{filename}' indexed with {len(chunks)} chunks",
        }

    except Exception as e:
        logger.error(f"RAG upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        tmp_path.unlink(missing_ok=True)


@app.get("/rag/status")
async def rag_status(session_id: str = "default"):
    if session_id in rag_store:
        store = rag_store[session_id]
        return {
            "active": True,
            "filename": store.get("filename", ""),
            "chunk_count": store.get("chunk_count", 0),
        }
    return {"active": False, "filename": "", "chunk_count": 0}


@app.delete("/rag/clear")
async def rag_clear(session_id: str = "default"):
    rag_store.pop(session_id, None)
    return {"status": "cleared"}


@app.post("/settings/validate")
async def settings_validate(request: Request):
    """Validate API keys by making test calls."""
    raw_headers = dict(request.headers)
    keys = {
        "groq": raw_headers.get("x-groq-key", ""),
        "gemini": raw_headers.get("x-gemini-key", ""),
        "openrouter": raw_headers.get("x-openrouter-key", ""),
    }

    results = {"groq": False, "gemini": False, "openrouter": False}

    # Test Groq
    if keys["groq"]:
        try:
            llm = build_groq_llm(keys["groq"])
            from langchain_core.messages import HumanMessage
            await llm.ainvoke([HumanMessage(content="Hi")])
            results["groq"] = True
        except Exception as e:
            logger.warning(f"Groq key invalid: {e}")

    # Test Gemini
    if keys["gemini"]:
        try:
            llm = build_gemini_llm(keys["gemini"])
            from langchain_core.messages import HumanMessage
            await llm.ainvoke([HumanMessage(content="Hi")])
            results["gemini"] = True
        except Exception as e:
            logger.warning(f"Gemini key invalid: {e}")

    # Test OpenRouter
    if keys["openrouter"]:
        try:
            llm = build_openrouter_llm(keys["openrouter"])
            from langchain_core.messages import HumanMessage
            await llm.ainvoke([HumanMessage(content="Hi")])
            results["openrouter"] = True
        except Exception as e:
            logger.warning(f"OpenRouter key invalid: {e}")

    return results


if __name__ == "__main__":
    import uvicorn
    # Use PORT environment variable if available (required for Render/Railway)
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

