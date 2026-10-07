/* =========================================================
   MILTON HOLDINGS LIMITED
   AUTHENTICATION MODULE
========================================================= */


/* ---------- auth ---------- */

function openAuth(mode,role){
    role=role||'customer';

    const mob=$('mobMenu');
    if(mob) mob.classList.remove('show');

    /* ---------- REGISTER ---------- */

    if(mode==='register'){

        openModal(
            'Create Your Account',
            `<form onsubmit="doRegister(event)">

                <div style="text-align:center;margin-bottom:14px">
                    ${logoSVG(58)}
                </div>

                <div class="fg">
                    <label>Full Name <span class="req">*</span></label>
                    <input
                        class="inp"
                        name="name"
                        required
                        placeholder="e.g. Chikondi Banda"
                    >
                </div>

                <div class="frow">

                    <div class="fg">
                        <label>Email <span class="req">*</span></label>
                        <input
                            class="inp"
                            type="email"
                            name="email"
                            required
                            placeholder="your@email.com"
                        >
                    </div>

                    <div class="fg">
                        <label>Phone <span class="req">*</span></label>
                        <input
                            class="inp"
                            name="phone"
                            required
                            placeholder="0999 000 000"
                        >
                    </div>

                </div>

                <div class="frow">

                    <div class="fg">
                        <label>District <span class="req">*</span></label>

                        <select
                            class="inp"
                            name="district"
                            required
                        >
                            ${DISTRICTS.map(d=>`<option>${d}</option>`).join('')}
                        </select>
                    </div>

                    <div class="fg">
                        <label>Area / Location <span class="req">*</span></label>

                        <input
                            class="inp"
                            name="area"
                            required
                        >
                    </div>

                </div>

                <div class="frow">

                    <div class="fg">
                        <label>Password <span class="req">*</span></label>

                        <input
                            class="inp"
                            type="password"
                            name="password"
                            minlength="6"
                            required
                            autocomplete="new-password"
                        >
                    </div>

                    <div class="fg">
                        <label>Confirm Password <span class="req">*</span></label>

                        <input
                            class="inp"
                            type="password"
                            name="password2"
                            minlength="6"
                            required
                            autocomplete="new-password"
                        >
                    </div>

                </div>

                <label class="check">
                    <input type="checkbox" required>
                    I agree to the MILTON HOLDINGS LIMITED terms and loan policy.
                </label>

                <button class="btn btn-gold btn-block">
                    Create Account
                </button>

                <p style="text-align:center;margin-top:12px;font-size:13px">
                    Already have an account?
                    <a
                        href="javascript:openAuth('login')"
                        style="color:var(--gold);font-weight:600"
                    >
                        Login
                    </a>
                </p>

            </form>`
        );

        return;
    }


    /* ---------- LOGIN ---------- */

    openModal(
        'Login to Your Account',

        `<form onsubmit="doLogin(event)">

            <div style="text-align:center;margin-bottom:14px">
                ${logoSVG(58)}
            </div>

            <div class="tabs">

                <button
                    type="button"
                    id="lgC"
                    class="${role==='customer'?'active':''}"
                    onclick="setLoginRole('customer')"
                >
                    👤 Customer
                </button>

                <button
                    type="button"
                    id="lgA"
                    class="${role==='admin'?'active':''}"
                    onclick="setLoginRole('admin')"
                >
                    🛡️ Admin
                </button>

            </div>

            <input
                type="hidden"
                name="role"
                id="lgRole"
                value="${role}"
            >

            <div class="fg">

                <label>Email or Phone Number</label>

                <input
                    class="inp"
                    type="text"
                    name="identifier"
                    id="lgIdentifier"
                    required
                    autocomplete="username"
                    placeholder="Email address or phone number"
                    value="${role==='admin'?'admin@milton.mw':'demo@milton.mw'}"
                >

            </div>

            <div class="fg">

                <label>Password</label>

                <input
                    class="inp"
                    type="password"
                    name="password"
                    id="lgPw"
                    required
                    autocomplete="current-password"
                    value="${role==='admin'?'admin123':'demo123'}"
                >

            </div>

            <button class="btn btn-gold btn-block">
                Login →
            </button>

            <p style="text-align:center;margin-top:10px;font-size:13px">

                <a
                    href="javascript:openForgotPassword()"
                    style="color:var(--gold);font-weight:600"
                >
                    Forgot password?
                </a>

            </p>

            <div class="alert alert-blue" style="margin-top:10px;margin-bottom:0">

                <b>Demo accounts</b><br>

                Customer:
                demo@milton.mw / demo123<br>

                Admin:
                admin@milton.mw / admin123

            </div>

            <p style="text-align:center;margin-top:12px;font-size:13px">

                New customer?

                <a
                    href="javascript:openAuth('register')"
                    style="color:var(--gold);font-weight:600"
                >
                    Create an account
                </a>

            </p>

            <p style="text-align:center;margin-top:8px;font-size:12px;color:var(--muted)">

                📱 Phone login and SMS OTP will be available
                when SMS authentication is configured.

            </p>

        </form>`
    );
}


/* ---------- login role ---------- */

function setLoginRole(r){

    $('lgRole').value=r;

    $('lgC').classList.toggle(
        'active',
        r==='customer'
    );

    $('lgA').classList.toggle(
        'active',
        r==='admin'
    );

    $('lgIdentifier').value=
        r==='admin'
            ? 'admin@milton.mw'
            : 'demo@milton.mw';

    $('lgPw').value=
        r==='admin'
            ? 'admin123'
            : 'demo123';
}


/* ---------- login ---------- */

async function doLogin(e){

    e.preventDefault();

    const f=e.target;

    const identifier=
        String(f.identifier.value||'').trim();

    const password=
        String(f.password.value||'');

    if(!identifier){

        return toast(
            'Please enter your email address or phone number.',
            'error'
        );
    }

    /*
       Phone authentication is intentionally not attempted yet.

       Supabase phone authentication requires an SMS provider.
       Once an SMS provider is connected, this section can be
       upgraded to support phone password/OTP authentication.
    */

    if(!identifier.includes('@')){

        return toast(
            '📱 Phone login will be available after SMS authentication is configured.',
            'info'
        );
    }

    try{

        const me=await remoteLogin(
            identifier,
            password
        );

        if(f.role.value!==me.role){

            return toast(
                '❌ Invalid account type selected.',
                'error'
            );
        }

        if(me.status==='suspended'){

            return toast(
                '🚫 This account is suspended.',
                'error'
            );
        }

        CU=me;

        closeModal();

        toast(
            'Welcome back, '+
            esc(
                (me.name||'Customer')
                .split(' ')[0]
            )+
            '! 👋'
        );

        enterApp();

        if(
            window._pendingApply &&
            me.role==='customer'
        ){

            go(
                'apply',
                {
                    type:window._pendingApply
                }
            );

            window._pendingApply=null;
        }

    }catch(err){

        toast(
            '❌ '+(
                err.message||
                'Login failed'
            ),
            'error'
        );
    }
}


/* ---------- registration ---------- */

async function doRegister(e){

    e.preventDefault();

    const f=e.target;

    if(
        f.password.value !==
        f.password2.value
    ){

        return toast(
            'Passwords do not match',
            'error'
        );
    }

    try{

        const me=await remoteRegister(

            f.name.value,

            f.email.value,

            f.phone.value,

            f.district.value,

            f.area.value,

            f.password.value

        );

        CU=me;

        closeModal();

        toast(
            '🎉 Account created! Your account number is '+
            (me.accountNo||'')
        );

        enterApp();

        if(window._pendingApply){

            go(
                'apply',
                {
                    type:window._pendingApply
                }
            );

            window._pendingApply=null;
        }

    }catch(err){

        toast(
            '❌ Registration failed: '+
            err.message,
            'error'
        );
    }
}


/* =========================================================
   PASSWORD RECOVERY
========================================================= */


/* ---------- forgot password ---------- */

function openForgotPassword(){

    openModal(

        'Recover Your Account',

        `<form onsubmit="sendPasswordReset(event)">

            <div style="text-align:center;margin-bottom:14px">
                ${logoSVG(58)}
            </div>

            <p style="font-size:14px;line-height:1.6;margin-bottom:16px">
                Enter the email address registered with
                MILTON HOLDINGS LIMITED.
                We will send you a secure password-reset link.
            </p>

            <div class="fg">

                <label>Email Address</label>

                <input
                    class="inp"
                    type="email"
                    name="email"
                    required
                    autocomplete="email"
                    placeholder="your@email.com"
                >

            </div>

            <button class="btn btn-gold btn-block">
                Send Recovery Link
            </button>

            <p style="text-align:center;margin-top:12px;font-size:13px">

                <a
                    href="javascript:openAuth('login')"
                    style="color:var(--gold);font-weight:600"
                >
                    ← Back to Login
                </a>

            </p>

        </form>`
    );
}


/* ---------- send password reset ---------- */

async function sendPasswordReset(e){

    e.preventDefault();

    const f=e.target;

    const email=
        String(f.email.value||'')
        .trim()
        .toLowerCase();

    if(!email){

        return toast(
            'Please enter your email address.',
            'error'
        );
    }

    try{

        const redirectTo=
            window.location.origin+
            window.location.pathname;

        const {error}=
            await sb.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo:redirectTo
                }
            );

        if(error) throw error;

        closeModal();

        toast(
            '📧 If that email is registered, a password recovery link has been sent.',
            'info'
        );

    }catch(err){

        toast(
            '❌ Password recovery failed: '+
            (
                err.message||
                'Please try again.'
            ),
            'error'
        );
    }
}


/* ---------- update password ---------- */

function openUpdatePassword(){

    openModal(

        'Create a New Password',

        `<form onsubmit="updateRecoveredPassword(event)">

            <div style="text-align:center;margin-bottom:14px">
                ${logoSVG(58)}
            </div>

            <p style="font-size:14px;line-height:1.6;margin-bottom:16px">
                Create a new password for your
                MILTON HOLDINGS LIMITED account.
            </p>

            <div class="fg">

                <label>New Password</label>

                <input
                    class="inp"
                    type="password"
                    name="password"
                    minlength="6"
                    required
                    autocomplete="new-password"
                    placeholder="Minimum 6 characters"
                >

            </div>

            <div class="fg">

                <label>Confirm New Password</label>

                <input
                    class="inp"
                    type="password"
                    name="password2"
                    minlength="6"
                    required
                    autocomplete="new-password"
                    placeholder="Repeat your new password"
                >

            </div>

            <button class="btn btn-gold btn-block">
                Update Password
            </button>

        </form>`
    );
}


/* ---------- complete password recovery ---------- */

async function updateRecoveredPassword(e){

    e.preventDefault();

    const f=e.target;

    const password=
        String(f.password.value||'');

    const password2=
        String(f.password2.value||'');

    if(password.length<6){

        return toast(
            'Password must contain at least 6 characters.',
            'error'
        );
    }

    if(password!==password2){

        return toast(
            'Passwords do not match.',
            'error'
        );
    }

    try{

        const {error}=
            await sb.auth.updateUser({
                password:password
            });

        if(error) throw error;

        closeModal();

        toast(
            '✅ Your password has been updated successfully.',
            'info'
        );

    }catch(err){

        toast(
            '❌ Could not update password: '+
            (
                err.message||
                'Please request a new recovery link.'
            ),
            'error'
        );
    }
}

/* ---------- recovery session fallback ---------- */
/*
   Handles recovery links when PASSWORD_RECOVERY
   was triggered before auth.js finished loading.
*/

(function recoverySessionFallback(){

    if(!window.sb || !sb.auth) return;

    setTimeout(async function(){

        try{

            const {data,error} =
                await sb.auth.getSession();

            if(error) return;

            if(data && data.session){

                const url =
                    window.location.href.toLowerCase();

                const isRecovery =
                    url.includes('type=recovery') ||
                    url.includes('recovery=1');

                if(isRecovery){

                    setTimeout(function(){

                        openUpdatePassword();

                    },150);

                }

            }

        }catch(err){

            console.error(
                'Recovery fallback:',
                err
            );

        }

    },500);

})();


/* =========================================================
   PASSWORD RECOVERY LISTENER
========================================================= */

(function initAuthRecovery(){

    if(!window.sb || !sb.auth) return;

    sb.auth.onAuthStateChange(
        function(event){

            if(event==='PASSWORD_RECOVERY'){

                setTimeout(
                    function(){
                        openUpdatePassword();
                    },
                    0
                );

            }

        }
    );

})();


/* ---------- logout ---------- */

async function logout(){

    try{

        await sb.auth.signOut();

    }catch(e){}

    CU=null;

    sessionStorage.removeItem(
        SS_KEY
    );

    showPublic();

    toast(
        'You have been logged out.',
        'info'
    );
}
