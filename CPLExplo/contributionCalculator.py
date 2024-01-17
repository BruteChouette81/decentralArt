"""
payment fee distribution: 1.65% - credit card, 1% - flat fee

    convertion F2C: 0.24% fee 

    EARN: 1% per mounth 

    convertion F2C: 0.24% fee 

    example: 1,200,000$ a year = 100,000/mounth

    flat 1% = 12,000$ / year

    investment rate: 50%

    (( 100,000 - 100,000 * 1.65% ) - ( 100,000 - 100,000 * 1.65% ) * 0.24%) * (1.01)^12

    mounth 1: 109,800
    mounth 2: 109,715
    mounth 3: 107,900
    mounth 4: 106,943
    mounth 5: 105,962
    mounth 6: 104,980
    mounth 7: 104,000
    mounth 8: 103,000
    mounth 9: 102,000
    mounth 10: 101,000
    mounth 11: 99,000

    total with no fees: 52,000$
    
"""
import matplotlib.pyplot as plt

## variables 

#fees
avg_payment_fee = 0.0165 # 1.65%

avg_f2c_fee = 0.0024 # 0.24%

flat_fee = 0.01 # flat fee without 
#transactions worth 

avg_volume_year = 1200000 # 1,200,000 $

commitment_rate = 0.5 # 50% of money stay in the account

earn_per_mounth = (0.1/12) # 10% a year


#other infos
num_of_years = 3
mode = "mounth" 


def calculateWorthByMounth():
    wby = []
    wbm = []
    worth1mounth = avg_volume_year / 12
    overall_P = 0
    for j in range(num_of_years):
        for i in range(12): #full year
            #remove fees
            #print(i)
           
            net_worth1mounth = (worth1mounth * (1-avg_payment_fee) * commitment_rate) * (1-avg_f2c_fee)
            
            worthNearn = (net_worth1mounth + net_worth1mounth * (earn_per_mounth * (12-i))) + ((overall_P/12) + (overall_P/12) * (earn_per_mounth * (12-i)))
            wbm.append(worthNearn + (worth1mounth*(1-commitment_rate)))
            

        
        for i in range(len(wbm)):
            if (i > j*12):
                
                overall_P += wbm[i]-(avg_volume_year/12)
        wby.append(overall_P)
    
        
    
    return wbm, wby

def Reverse(lst):
   new_lst = lst[::-1]
   return new_lst

#function to 
def graph(wbm):
    
    plt.plot(wbm)
    plt.ylabel('worth')
    plt.show()

if __name__ == '__main__':
    wbm, wby = calculateWorthByMounth()
    print(f"Worth by mounth: {wbm}")
    print(f"Profit by year: {wby}")
    Pwbm = []
    for i in range(len(wbm)):
        Pwbm.append(wbm[i]-(avg_volume_year/12))
        
    print(f"Profit by mounth: {Pwbm}")

    overall_P = 0
    for i in range(len(wbm)):
       overall_P += wbm[i]-(avg_volume_year/12)

    print(f"Overall Profit: {overall_P} $ ({(overall_P/avg_volume_year*100)})")

    #graph(Reverse(wbm))

