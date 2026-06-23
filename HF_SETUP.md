# 🤗 Hugging Face Setup Guide (Free Tier)

## Step 1: Create a Free Hugging Face Account

1. Go to [huggingface.co](https://huggingface.co/)
2. Click **"Sign Up"** (top right)
3. Sign up with GitHub, Google, or email
4. **No credit card required!**

## Step 2: Get Your API Token

1. After logging in, click your **profile picture** (top right)
2. Click **"Settings"**
3. Go to **"Access Tokens"** tab
4. Click **"New token"**
5. Give it a name (e.g., "INS Tunisia AI")
6. Select **"Read"** permission (default)
7. Click **"Generate token"**
8. **Copy the token** (starts with `hf_...`) - you won't see it again!

## Step 3: Add to Your Environment

### For Local Development:
Create/edit `.env` file in your project root:
```bash
HF_API_KEY=hf_your_actual_token_here
```

### For Render Deployment:
1. Go to your Render dashboard
2. Select your web service
3. Click **"Environment"** tab
4. Add new variable:
   - **Key:** `HF_API_KEY`
   - **Value:** `hf_your_actual_token_here`
5. Click **"Save Changes"**

## Step 4: Test the AI

Once deployed, test the chat assistant on your website!

### Notes on Free Tier:
- ✅ **Completely free** - no credit card needed
- ⏳ Model may need ~30s to "warm up" on first request
- 🔄 If you get "loading" error, just wait and retry
- 📊 Rate limits: ~300 requests/hour (plenty for demo/small apps)

## Alternative Free Models

If Qwen is too slow, try these faster alternatives in `proxy.js`:

```javascript
// Faster but smaller model
const model = "microsoft/Phi-3-mini-4k-instruct";

// Good balance of speed/quality
const model = "mistralai/Mistral-7B-Instruct-v0.3";
```

Just change line 228 in `proxy.js`!
