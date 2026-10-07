/* =========================================================
   MILTON HOLDINGS LIMITED
   AUTHENTICATION MODULE
========================================================= */

/* ---------- auth ---------- */
function openAuth(mode,role){role=role||'customer';$('mobMenu').classList.remove('show');
 if(mode==='register'){openModal('Create Your Account',`<form onsubmit="doRegister(event)">
 <div style="text-align:center;margin-bottom:14px">${logoSVG(58)}</div>
 <div class="fg"><label>Full Name <span class="req">*</span></label><input class="inp" name="name" required placeholder="e.g. Chikondi Banda"></div>
 <div class="frow"><div class="fg"><label>Email <span class="req">*</span></label><input class="inp" type="email" name="email" required></div><div class="fg"><label>Phone <span class="req">*</span></label><input class="inp" name="phone" required placeholder="0999 000 000"></div></div>
 <div class="frow"><div class="fg"><label>District <span class="req">*</span></label><select class="inp" name="district" required>${DISTRICTS.map(d=>`<option>${d}</option>`).join('')}</select></div><div class="fg"><label>Area / Location <span class="req">*</span></label><input class="inp" name="area" required></div></div>
 <div class="frow"><div class="fg"><label>Password <span class="req">*</span></label><input class="inp" type="password" name="password" minlength="6" required></div><div class="fg"><label>Confirm Password <span class="req">*</span></label><input class="inp" type="password" name="password2" minlength="6" required></div></div>
 <label class="check"><input type="checkbox" required> I agree to the MILTON HOLDINGS LIMITED terms and loan policy.</label>
 <button class="btn btn-gold btn-block">Create Account</button>
 <p style="text-align:center;margin-top:12px;font-size:13px">Already have an account? <a href="javascript:openAuth('login')" style="color:var(--gold);font-weight:600">Login</a></p></form>`);return}
 openModal('Login to Your Account',`<form onsubmit="doLogin(event)">
 <div style="text-align:center;margin-bottom:14px">${logoSVG(58)}</div>
 <div class="tabs"><button type="button" id="lgC" class="${role==='customer'?'active':''}" onclick="setLoginRole('customer')">👤 Customer</button><button type="button" id="lgA" class="${role==='admin'?'active':''}" onclick="setLoginRole('admin')">🛡️ Admin</button></div>
 <input type="hidden" name="role" id="lgRole" value="${role}">
 <div class="fg"><label>Email Address</label><input class="inp" type="email" name="email" id="lgEmail" required value="${role==='admin'?'admin@milton.mw':'demo@milton.mw'}"></div>
 <div class="fg"><label>Password</label><input class="inp" type="password" name="password" id="lgPw" required value="${role==='admin'?'admin123':'demo123'}"></div>
 <button class="btn btn-gold btn-block">Login →</button>
 <div class="alert alert-blue" style="margin-top:14px;margin-bottom:0"><b>Demo accounts</b><br>Customer: demo@milton.mw / demo123<br>Admin: admin@milton.mw / admin123</div>
 <p style="text-align:center;margin-top:12px;font-size:13px">New customer? <a href="javascript:openAuth('register')" style="color:var(--gold);font-weight:600">Create an account</a></p></form>`)}
function setLoginRole(r){$('lgRole').value=r;$('lgC').classList.toggle('active',r==='customer');$('lgA').classList.toggle('active',r==='admin');$('lgEmail').value=r==='admin'?'admin@milton.mw':'demo@milton.mw';$('lgPw').value=r==='admin'?'admin123':'demo123'}
/* ---------- Supabase auth ---------- */

async function doLogin(e){
    e.preventDefault();

    const f=e.target;

    try{
        const me=await remoteLogin(
            f.email.value,
            f.password.value
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
            esc((me.name||'Customer').split(' ')[0])+
            '! 👋'
        );

        enterApp();

        if(window._pendingApply&&me.role==='customer'){
            go('apply',{type:window._pendingApply});
            window._pendingApply=null;
        }

    }catch(err){

        toast(
            '❌ '+(err.message||'Login failed'),
            'error'
        );
    }
}


async function doRegister(e){
    e.preventDefault();

    const f=e.target;

    if(f.password.value!==f.password2.value){
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
            go('apply',{
                type:window._pendingApply
            });

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


async function logout(){

    try{
        await sb.auth.signOut();
    }catch(e){}

    CU=null;

    sessionStorage.removeItem(SS_KEY);

    showPublic();

    toast(
        'You have been logged out.',
        'info'
    );
}
