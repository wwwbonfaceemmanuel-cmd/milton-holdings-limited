/* =========================================================
   MILTON HOLDINGS LIMITED
   LOANS MODULE
========================================================= */

/* ---------- loan actions ---------- */
function createLoan(userId,type,amount,months,app,docs,date){
 const c=calcLoan(type,amount,months);
 DB.counters.loan++;

 const l={
  id:uid('l'),
  ref:'MHL-'+DB.counters.loan,
  userId,
  type,
  amount:c.amount,
  months:c.months,
  rate:c.rate,
  interest:c.interest,
  total:c.total,
  installment:c.installment,
  purpose:(app&&app.purpose)||'',
  status:'pending',
  reason:'',
  appliedAt:date||Date.now(),
  approvedAt:null,
  disbursedAt:null,
  closedAt:null,
  disburseMethod:'',
  disburseRef:'',
  paid:0,
  balance:c.total,
  schedule:[],
  app:app||{},
  docs:docs||{}
 };

 DB.loans.unshift(l);

 notify(
  userId,
  'Application Received',
  `Your ${typeLabel(type)} loan application ${l.ref} for ${fmt(l.amount)} has been received and is under review.`,
  '📝',
  date
 );

 notify(
  'admin',
  'New Loan Application',
  `${uname(userId)} applied for a ${typeLabel(type)} loan of ${fmt(l.amount)} (${l.ref}).`,
  '📝',
  date
 );

 return l;
}

function approveLoan(l,date){
 l.status='approved';
 l.approvedAt=date||Date.now();
 l.reason='';

 notify(
  l.userId,
  'Loan Approved 🎉',
  `Congratulations! Your loan ${l.ref} of ${fmt(l.amount)} has been approved and will be disbursed shortly.`,
  '✅',
  date
 );
}

function rejectLoan(l,reason,date){
 l.status='rejected';
 l.reason=reason;
 l.rejectedAt=date||Date.now();

 notify(
  l.userId,
  'Loan Application Rejected',
  `Your loan ${l.ref} was not approved. Reason: ${reason}`,
  '❌',
  date
 );
}

function disburseLoan(l,date,method,ref){
 date=date||Date.now();

 l.status='disbursed';
 l.disbursedAt=date;
 l.disburseMethod=method||l.app.payMethod||'Mpamba (TNM)';
 l.disburseRef=ref||'';

 if(!l.approvedAt)l.approvedAt=date;

 l.schedule=buildSchedule(l,date);
 l.balance=r2(l.total-l.paid);

 addTx(
  l.userId,
  'Loan Disbursement',
  l.amount,
  'credit',
  `${l.ref} disbursed via ${l.disburseMethod}`,
  date,
  l.id,
  l.disburseMethod
 );

 const f=l.schedule[0];

 notify(
  l.userId,
  'Loan Disbursed 💸',
  `${fmt(l.amount)} for loan ${l.ref} has been sent to you via ${l.disburseMethod}. Total repayable: ${fmt(l.total)}. First installment of ${fmt(f.amount)} is due on ${fdate(f.due)}.`,
  '💸',
  date
 );
}

function allocate(l,amt,date){
 l.paid=r2(l.paid+amt);
 l.balance=Math.max(0,r2(l.total-l.paid));

 let rem=amt;

 for(const s of l.schedule){
  const need=r2(s.amount-s.paid);

  if(need>0&&rem>0){
   const p=Math.min(need,rem);

   s.paid=r2(s.paid+p);
   rem=r2(rem-p);

   if(s.paid>=s.amount-0.01)s.paidAt=date;
  }
 }

 if(l.balance<=0.01){
  l.status='closed';
  l.closedAt=date;

  notify(
   l.userId,
   'Loan Fully Repaid 🏆',
   `Well done! Loan ${l.ref} is fully repaid and closed. You now qualify for a higher limit.`,
   '🏆',
   date
  );
 }
}

function runReminders(){
 if(!DB.settings.autoReminders)return;

 let changed=false;

 DB.loans
  .filter(l=>l.status==='disbursed')
  .forEach(l=>
   l.schedule.forEach(s=>{
    if(s.paid>=s.amount-0.01)return;

    const diff=s.due-Date.now();

    if(diff>0&&diff<=3*DAY&&!s.reminded){
     s.reminded=true;
     changed=true;

     notify(
      l.userId,
      'Payment Reminder ⏰',
      `Installment #${s.n} of ${fmt(s.amount-s.paid)} for ${l.ref} is due on ${fdate(s.due)}. Pay via Mpamba ${DB.settings.mpambaNumber} or bank transfer.`,
      '⏰'
     );
    }

    if(diff<0&&!s.overdueNotified){
     s.overdueNotified=true;
     changed=true;

     notify(
      l.userId,
      'Installment Overdue ⚠️',
      `Installment #${s.n} for ${l.ref} (${fmt(s.amount-s.paid)}) was due on ${fdate(s.due)}. A ${DB.settings.penaltyRate}% penalty may apply. Please pay immediately.`,
      '⚠️'
     );

     notify(
      'admin',
      'Overdue Installment',
      `${uname(l.userId)} – ${l.ref} installment #${s.n} is overdue (${fmt(s.amount-s.paid)}).`,
      '⚠️'
     );
    }
   })
  );

 if(changed)save();
}

/* ---------- repayment actions ---------- */

function submitRepayment(userId,loanId,amount,method,reference,payer,date,proof){
    DB.counters.rep++;

    const l=loanById(loanId);

    const r={
        id:uid('r'),
        ref:'RPY-'+DB.counters.rep,
        userId,
        loanId,
        loanRef:l?l.ref:'',
        amount:r2(amount),
        method,
        reference,
        payer:payer||'',
        date:date||Date.now(),
        status:'pending',
        proof:proof||null,
        confirmedAt:null,
        note:''
    };

    DB.repayments.unshift(r);

    notify(
        userId,
        'Repayment Submitted',
        `Your ${method} repayment of ${fmt(amount)} for ${r.loanRef} (Ref: ${reference}) was received and is awaiting confirmation.`,
        '💳',
        date
    );

    notify(
        'admin',
        'Repayment Awaiting Confirmation',
        `${uname(userId)} submitted ${fmt(amount)} via ${method} for ${r.loanRef}.`,
        '💳',
        date
    );

    return r;
}


function confirmRepayment(r,date){
    date=date||Date.now();

    const l=loanById(r.loanId);

    r.status='confirmed';
    r.confirmedAt=date;

    if(l){
        allocate(l,r.amount,date);
    }

    addTx(
        r.userId,
        'Loan Repayment',
        r.amount,
        'debit',
        `Repayment for ${r.loanRef} via ${r.method} (Ref: ${r.reference})`,
        date,
        r.loanId,
        r.method
    );

    notify(
        r.userId,
        'Repayment Confirmed ✅',
        `Your payment of ${fmt(r.amount)} for ${r.loanRef} has been confirmed. Remaining balance: ${fmt(l?l.balance:0)}.`,
        '✅',
        date
    );
}


function rejectRepayment(r,note){
    r.status='rejected';
    r.note=note;

    notify(
        r.userId,
        'Repayment Not Verified',
        `Your payment ${r.ref} of ${fmt(r.amount)} could not be verified. Reason: ${note}. Please contact support.`,
        '⚠️'
    );
}
