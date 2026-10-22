'use strict';
const dialog=document.querySelector('#inquiry-dialog');
const preview=document.querySelector('#inquiry-preview');
const status=document.querySelector('#result-status');
let returnFocus;
const fields=['name','email','phone','company','service'];
document.querySelectorAll('.flip').forEach(card=>{
 const checkbox=card.querySelector('input[type="checkbox"]');
 const front=card.querySelector('.front');
 const back=card.querySelector('.back');
 const backLabel=back.querySelector('.back-btn');
 const backButton=document.createElement('button');
 backButton.type='button';backButton.className='back-btn';backButton.textContent='Back';backLabel.replaceWith(backButton);
 back.querySelectorAll('input,select').forEach((field,i)=>{field.name=fields[i];field.autocomplete=['name','email','tel','organization','off'][i];if(field.tagName==='INPUT')field.maxLength=i===1?254:150;});
 function sync(){const flipped=checkbox.checked;back.inert=!flipped;front.inert=flipped;checkbox.setAttribute('aria-expanded',String(flipped));}
 sync();checkbox.addEventListener('change',()=>{sync();if(checkbox.checked)backButton.focus();});
 backButton.addEventListener('click',()=>{checkbox.checked=false;sync();checkbox.focus();});
 card.addEventListener('keydown',event=>{if(event.key==='Escape'&&checkbox.checked){event.preventDefault();backButton.click();}if(event.key==='Enter'&&event.target===checkbox){event.preventDefault();checkbox.click();}});
 back.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(back);const category=front.querySelector('h3').textContent;preview.value=`one9studio — Inquiry\n\nCategory: ${category}\nService: ${data.get('service')}\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone')}\nPerson / company: ${data.get('company')}`;status.textContent='Your inquiry is ready. It has not been sent.';returnFocus=back.querySelector('.submit');dialog.showModal();});
});
function closeResult(){dialog.close();returnFocus?.focus();}
document.querySelector('#close-result').addEventListener('click',closeResult);
dialog.addEventListener('cancel',event=>{event.preventDefault();closeResult();});
document.querySelector('#copy-inquiry').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(preview.value);status.textContent='Copied. Your inquiry has not been sent.';}catch{preview.focus();preview.select();status.textContent='Copy the selected text manually, or download the draft.';}});
document.querySelector('#download-inquiry').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([preview.value],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='one9studio-inquiry.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='Downloaded. Your inquiry has not been sent.';});
const booking=document.querySelector('#cb');const bookingPanel=document.querySelector('.cb-panel');
booking.setAttribute('aria-controls','booking-panel');bookingPanel.id='booking-panel';
booking.addEventListener('change',()=>{booking.setAttribute('aria-expanded',String(booking.checked));});booking.setAttribute('aria-expanded','false');
document.querySelectorAll('.cb-item').forEach(button=>button.addEventListener('click',()=>{booking.checked=false;booking.setAttribute('aria-expanded','false');const card=document.querySelector('#f2').closest('.flip');const checkbox=card.querySelector('input[type="checkbox"]');checkbox.checked=true;checkbox.dispatchEvent(new Event('change'));const select=card.querySelector('select');let option=Array.from(select.options).find(item=>item.text===button.textContent);if(!option){option=new Option(button.textContent,button.textContent);select.add(option);}select.value=option.value;card.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'center'});card.querySelector('form input').focus({preventScroll:true});}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&booking.checked){booking.checked=false;booking.setAttribute('aria-expanded','false');booking.focus();}});
document.querySelector('#year').textContent=new Date().getFullYear();
